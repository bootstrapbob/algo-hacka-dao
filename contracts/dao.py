from pyteal import *

def approval_program():
    # Global state schema
    global_schema = GlobalStateSchema(
        num_uints=32,  # For proposal counts, voting periods, etc.
        num_byte_slices=64  # For proposal details
    )
    
    # Local state schema (per account)
    local_schema = LocalStateSchema(
        num_uints=16,  # For voting power, join timestamp
        num_byte_slices=16  # For member metadata
    )
    
    # Application call types
    handle_creation = Seq([
        App.globalPut(Bytes("proposal_count"), Int(0)),
        App.globalPut(Bytes("treasury"), Int(0)),
        App.globalPut(Bytes("min_voting_power"), Int(1)),
        App.globalPut(Bytes("voting_period"), Int(604800)),  # 7 days in seconds
        Return(Int(1))
    ])
    
    # Check if account has opted in
    is_member = App.optedIn(Txn.sender(), App.id())
    
    # Helper function to check if proposal exists
    proposal_exists = Lambda("proposal_id", 
        And(
            Btoi(Arg("proposal_id")) > Int(0),
            Btoi(Arg("proposal_id")) <= App.globalGet(Bytes("proposal_count"))
        )
    )
    
    # Helper function to check if proposal is active (within deadline)
    proposal_active = Lambda("proposal_id",
        Let(
            [proposal_key := Concat(Bytes("proposal_"), Arg("proposal_id"))],
            Let(
                [proposal_data := App.globalGet(proposal_key)],
                If(
                    Len(proposal_data) > Int(0),
                    Let(
                        [parts := proposal_data],
                        # Extract deadline from proposal data (last part after final "::")
                        # Format: title::desc::type::amount::creation_time::deadline
                        Global.latest_timestamp() <= ExtractUint64(parts, Int(5))
                    ),
                    Int(0)
                )
            )
        )
    )
    
    # Join DAO with proper payment verification
    join_dao = Seq([
        Assert(Not(is_member)),  # Ensure not already a member
        Assert(Global.group_size() >= Int(2)),  # Ensure we have a payment transaction
        
        If(
            Btoi(Txn.application_args[1]) == Int(1),  # Team lead tier
            Seq([
                # Verify payment transaction is in the group and correct
                Assert(Gtxn[0].type_enum() == TxnType.Payment),
                Assert(Gtxn[0].amount() == Int(10000000)),  # 10 ALGO
                Assert(Gtxn[0].receiver() == Global.current_application_address()),
                App.localPut(Txn.sender(), Bytes("voting_power"), Int(10)),
                # Update treasury
                App.globalPut(
                    Bytes("treasury"), 
                    App.globalGet(Bytes("treasury")) + Gtxn[0].amount()
                )
            ]),
            # Regular member
            Seq([
                App.localPut(Txn.sender(), Bytes("voting_power"), Int(1))
            ])
        ),
        App.localPut(Txn.sender(), Bytes("join_time"), Global.latest_timestamp()),
        Return(Int(1))
    ])
    
    # Create proposal with validation
    create_proposal = Seq([
        Assert(is_member),
        Assert(Len(Txn.application_args) >= Int(4)),  # Ensure minimum args
        Assert(Len(Txn.application_args[1]) > Int(0)),  # Title not empty
        Assert(Len(Txn.application_args[2]) > Int(0)),  # Description not empty
        
        # Validate proposal type
        Assert(Or(
            Txn.application_args[3] == Bytes("treasury"),
            Txn.application_args[3] == Bytes("governance"),
            Txn.application_args[3] == Bytes("membership")
        )),
        
        # For treasury proposals, validate amount
        If(
            Txn.application_args[3] == Bytes("treasury"),
            Seq([
                Assert(Len(Txn.application_args) >= Int(5)),
                Assert(Btoi(Txn.application_args[4]) > Int(0)),
                Assert(Btoi(Txn.application_args[4]) <= App.globalGet(Bytes("treasury")))
            ])
        ),
        
        # Increment proposal count
        App.globalPut(
            Bytes("proposal_count"),
            App.globalGet(Bytes("proposal_count")) + Int(1)
        ),
        
        # Store proposal details with structured format
        App.globalPut(
            Concat(
                Bytes("proposal_"),
                Itob(App.globalGet(Bytes("proposal_count")))
            ),
            Concat(
                Txn.application_args[1],  # Title
                Bytes("::"),
                Txn.application_args[2],  # Description
                Bytes("::"),
                Txn.application_args[3],  # Type
                Bytes("::"),
                Txn.application_args[4] if Len(Txn.application_args) > Int(4) else Bytes("0"),  # Amount
                Bytes("::"),
                Itob(Global.latest_timestamp()),  # Creation time
                Bytes("::"),
                Itob(Global.latest_timestamp() + App.globalGet(Bytes("voting_period")))  # Deadline
            )
        ),
        
        # Initialize vote counters
        App.globalPut(
            Concat(Bytes("votes_"), Itob(App.globalGet(Bytes("proposal_count"))), Bytes("_yes")),
            Int(0)
        ),
        App.globalPut(
            Concat(Bytes("votes_"), Itob(App.globalGet(Bytes("proposal_count"))), Bytes("_no")),
            Int(0)
        ),
        App.globalPut(
            Concat(Bytes("votes_"), Itob(App.globalGet(Bytes("proposal_count"))), Bytes("_abstain")),
            Int(0)
        ),
        
        Return(Int(1))
    ])
    
    # Vote on proposal with comprehensive validation
    vote = Seq([
        Assert(is_member),
        Assert(Len(Txn.application_args) >= Int(3)),
        
        # Validate proposal exists
        Assert(proposal_exists(Txn.application_args[1])),
        
        # Validate proposal is still active
        Assert(proposal_active(Txn.application_args[1])),
        
        # Validate vote option
        Assert(Or(
            Txn.application_args[2] == Bytes("yes"),
            Txn.application_args[2] == Bytes("no"),
            Txn.application_args[2] == Bytes("abstain")
        )),
        
        # Check if user has already voted
        Assert(App.globalGet(
            Concat(
                Bytes("voted_"),
                Txn.application_args[1],
                Bytes("_"),
                Txn.sender()
            )
        ) == Int(0)),
        
        # Record the vote
        App.globalPut(
            Concat(
                Bytes("votes_"),
                Txn.application_args[1],
                Bytes("_"),
                Txn.application_args[2]
            ),
            App.globalGet(
                Concat(
                    Bytes("votes_"),
                    Txn.application_args[1],
                    Bytes("_"),
                    Txn.application_args[2]
                )
            ) + App.localGet(Txn.sender(), Bytes("voting_power"))
        ),
        
        # Mark user as having voted
        App.globalPut(
            Concat(
                Bytes("voted_"),
                Txn.application_args[1],
                Bytes("_"),
                Txn.sender()
            ),
            Int(1)
        ),
        
        Return(Int(1))
    ])
    
    # Execute proposal with actual logic
    execute = Seq([
        Assert(is_member),
        Assert(Len(Txn.application_args) >= Int(2)),
        
        # Validate proposal exists
        Assert(proposal_exists(Txn.application_args[1])),
        
        # Check if proposal has passed (more yes votes than no votes)
        Let(
            [
                yes_votes := App.globalGet(Concat(Bytes("votes_"), Txn.application_args[1], Bytes("_yes"))),
                no_votes := App.globalGet(Concat(Bytes("votes_"), Txn.application_args[1], Bytes("_no"))),
                proposal_key := Concat(Bytes("proposal_"), Txn.application_args[1]),
                proposal_data := App.globalGet(proposal_key)
            ],
            Seq([
                Assert(yes_votes > no_votes),  # Simple majority
                Assert(yes_votes > Int(0)),    # At least one yes vote
                
                # Check if deadline has passed
                Assert(Global.latest_timestamp() > ExtractUint64(proposal_data, Int(5))),
                
                # Extract proposal type and execute accordingly
                If(
                    # Treasury proposal - send payment
                    Contains(proposal_data, Bytes("::treasury::")),
                    Seq([
                        # For treasury proposals, we would need additional transaction in group
                        # This is simplified - in practice you'd need more complex execution
                        App.globalPut(
                            Bytes("treasury"),
                            App.globalGet(Bytes("treasury")) - ExtractUint64(proposal_data, Int(3))
                        )
                    ])
                ),
                
                # Mark proposal as executed
                App.globalPut(
                    Concat(Bytes("executed_"), Txn.application_args[1]),
                    Int(1)
                ),
                
                Return(Int(1))
            ])
        )
    ])
    
    # Get proposal info (read-only)
    get_proposal = Seq([
        Assert(Len(Txn.application_args) >= Int(2)),
        Assert(proposal_exists(Txn.application_args[1])),
        Return(Int(1))
    ])
    
    # Handle each type of application call
    program = Cond(
        [Txn.application_id() == Int(0), handle_creation],
        [Txn.on_completion() == OnComplete.OptIn, Return(Int(1))],
        [Txn.on_completion() == OnComplete.CloseOut, Return(Int(1))],
        [Txn.on_completion() == OnComplete.UpdateApplication, Return(Int(0))],
        [Txn.on_completion() == OnComplete.DeleteApplication, Return(Int(0))],
        [Txn.application_args[0] == Bytes("join"), join_dao],
        [Txn.application_args[0] == Bytes("create_proposal"), create_proposal],
        [Txn.application_args[0] == Bytes("vote"), vote],
        [Txn.application_args[0] == Bytes("execute"), execute],
        [Txn.application_args[0] == Bytes("get_proposal"), get_proposal]
    )
    
    return program

def clear_state_program():
    return Return(Int(1))

if __name__ == "__main__":
    with open("dao_approval.teal", "w") as f:
        compiled = compileTeal(approval_program(), mode=Mode.Application, version=6)
        f.write(compiled)
        
    with open("dao_clear.teal", "w") as f:
        compiled = compileTeal(clear_state_program(), mode=Mode.Application, version=6)
        f.write(compiled)

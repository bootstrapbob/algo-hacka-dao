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
        Return(Int(1))
    ])
    
    # Check if account has opted in
    is_member = App.optedIn(Txn.sender(), App.id())
    
    # Join DAO
    join_dao = Seq([
        Assert(Not(is_member)),  # Ensure not already a member
        If(
            Btoi(Txn.application_args[1]) == Int(1),  # Team lead tier
            Seq([
                Assert(Gtxn[1].type_enum() == TxnType.Payment),
                Assert(Gtxn[1].amount() == Int(10000000)),  # 10 ALGO
                App.localPut(Txn.sender(), Bytes("voting_power"), Int(10))
            ]),
            App.localPut(Txn.sender(), Bytes("voting_power"), Int(1))
        ),
        App.localPut(Txn.sender(), Bytes("join_time"), Global.latest_timestamp()),
        Return(Int(1))
    ])
    
    # Create proposal
    create_proposal = Seq([
        Assert(is_member),
        # Get current proposal count
        App.globalPut(
            Bytes("proposal_count"),
            App.globalGet(Bytes("proposal_count")) + Int(1)
        ),
        # Store proposal details
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
                Txn.application_args[4] if Len(Txn.application_args) > 4 else Bytes("0"),  # Amount
                Bytes("::"),
                Itob(Global.latest_timestamp()),  # Creation time
                Bytes("::"),
                Itob(Global.latest_timestamp() + Int(604800))  # Deadline (7 days)
            )
        ),
        Return(Int(1))
    ])
    
    # Vote on proposal
    vote = Seq([
        Assert(is_member),
        Assert(App.globalGet(
            Concat(
                Bytes("voted_"),
                Txn.application_args[1],
                Bytes("_"),
                Txn.sender()
            )
        ) == Int(0)),  # Ensure hasn't voted
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
    
    # Execute proposal
    execute = Seq([
        Assert(is_member),
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
        [Txn.application_args[0] == Bytes("execute"), execute]
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
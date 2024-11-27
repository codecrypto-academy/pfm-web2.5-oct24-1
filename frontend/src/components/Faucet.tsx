import { useEffect, useState } from "react"
import { ToastContainer, useToast } from "../components/Toast/Toast";
import { useParams } from 'react-router-dom'
import { Link } from "react-router-dom";

interface Transaction {
    address: string
    block: number
    txHash: string
    amount: string
    balance: string
    date: string
}

export const Faucet:React.FC = () => {
    const { id } = useParams<{id: string}>()
    const [state, setState] = useState<{
        account: string|null, 
        balance: string | null}>({
            account: null,
            balance: null})
    const [loading, setLoading] = useState<boolean>(false)
    const [tx, setTx] = useState<Transaction | null>()
    const { toasts, showToast, removeToast } = useToast();
    
    useEffect(() =>{
        const ethereum = (window as any).ethereum
        if (ethereum == null) {
            alert("Install metamask")
            return
        }

        const updateBalance = (account: string) => {
            ethereum
                .request({
                    method: "eth_getBalance",
                    params: [account, "latest"],
                })
                .then((balance: string) => {
                    const balanceInWei = parseInt(balance, 16);
                    const ethFactor = 10**18
                    const balanceInEth = balanceInWei / ethFactor;
                    console.log(balanceInEth)// Convert Wei to Ether
                    setState((prevState) => ({
                        ...prevState,
                        account,
                        balance: balanceInEth.toString(),
                    }));
                })
                .catch((error: any) => {
                    console.error("Error fetching balance:", error);
                });
        };

        const handleAccountsChanged = (accounts: string[]) => {
            if (accounts.length === 0) {
                alert("No account found");
                setState((prevState) => ({
                    ...prevState,
                    account: null,
                    balance: "0",
                }));
            } else {
                const account = accounts[0];
                setState((prevState) => ({ ...prevState, account }));
                updateBalance(account);
            }
        };

        ethereum
        .request({ method: "eth_accounts" })
        .then((accounts: string[]) => {
            if (accounts.length > 0) {
                handleAccountsChanged(accounts);
            } else {
                alert("No account found");
            }
        })
        .catch((error: any) => {
            console.error("Error fetching accounts:", error);
        });

        ethereum.on("accountsChanged", handleAccountsChanged);

        return () => {
        // Clean up the event listener
            ethereum.removeListener("accountsChanged", handleAccountsChanged);
        };
    }, [setState])

    const apiUrl = import.meta.env.VITE_API_URL

    async function handleClick() {
        setLoading(true)
        if (!state.account){
            return   
        }
        try {
            const response = await fetch(`${apiUrl}/network/${id}/faucet/${state.account}`,{
                method: "GET"
            })
            if (!response.ok){
                showToast("Transaction error.", "error")
                setLoading(false)
                return
            }
            showToast("Transaction completed succsessfuly.")
            const transaction = await response.json() as Transaction | null
            if(!transaction) {
                setLoading(false)
                return
            }                
            setTx(transaction)
            setState((prevState) => ({ ...prevState, balance: transaction.balance.toString()})) 
            setLoading(false)
        } catch (error) {
            showToast("An error occurred during the transaction.", "error")
            setLoading(false)
        }
    }
    
    return(
        <div className="container mt-4">
            <ToastContainer toasts={toasts} removeToast={removeToast} />
            <h3>Faucet</h3>
            <section className="card mb-4">
                <div className="card-body">
                    <h5 className="card-title">Account Information</h5>
                    <ul className="list-unstyled mb-0">
                        <li className="mb-2">
                        <strong className="me-2">Address:</strong>
                            { state.account ? <Link to={`/network/${id}/explorer/address/${state.account}`}> {state.account} </Link> : "Wating for address..." }
                        </li>
                        <li className="mb-2">
                        <strong className="me-2">Balance:</strong>
                            { state.balance ? state.balance : "Wating for balance..." }
                        </li>
                    </ul>
                        {!loading ? (
                            <button 
                                onClick={async () => handleClick()} 
                                disabled={loading}
                                className="btn btn-outline-success btn-sm d-flex"
                            >Ask for funds
                            </button>
                            ) : (
                            <button
                            disabled={loading}
                            className="btn btn-warning btn-sm d-flex"
                            >
                            Waiting for tx...
                            <div className="spinner-border spinner-border-sm ms-1" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </div>
                            </button>)}
                </div>
            </section>
            { tx && 
            <section className="card mb-4">
                <div className="card-body">
                    <h5 className="card-title">Transaction Information</h5>
                    <ul className="list-unstyled mb-0">
                        <li className="mb-2">
                        <strong className="me-2">Block Number:</strong>
                            <Link to={`/network/${id}/explorer/block/${tx.block}`}>
                            {JSON.stringify(tx.block).trim().replace(/^["']|["']$/g, '')}
                            </Link>
                        </li>
                        <li className="mb-2">
                        <strong className="me-2">Transaction Hash:</strong>
                            <Link to={`/network/${id}/explorer/transaction/${tx.txHash}`}>
                            {JSON.stringify(tx.txHash).trim().replace(/^["']|["']$/g, '')}
                            </Link>
                        </li>
                        <li className="mb-2">
                        <strong className="me-2">Balance:</strong>
                            {JSON.stringify(tx.balance).trim().replace(/^["']|["']$/g, '')}
                        </li>
                        <li className="mb-2">
                        <strong className="me-2">Amount recived:</strong>
                            {JSON.stringify(tx.amount).trim().replace(/^["']|["']$/g, '')}
                        </li>
                        <li>
                        <strong className="me-2">Timestamp:</strong>
                            {JSON.stringify(tx.date).trim().replace(/^["']|["']$/g, '')}
                        </li>
                    </ul>                    
                </div>
            </section>}
        </div>
    )
}
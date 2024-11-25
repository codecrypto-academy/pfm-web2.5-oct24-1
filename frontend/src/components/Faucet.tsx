import { useEffect, useState } from "react"
import { useParams } from 'react-router-dom'

export const Faucet:React.FC = () => {
    const { id } = useParams<{id: string}>()
    const [state, setState] = useState<{account: string|null}>({account: null})
    const [loading, setLoading] = useState<boolean>(false)
    const [tx, setTx] = useState<object | null>()
    
    useEffect(() =>{
        const ethereum = (window as any).ethereum
        if (ethereum == null) {
            alert("Install metamask")
            return
        }
        ethereum.request({
            method:"eth_accounts"
        }).then((accounts: string[]) =>{
            setState({account: accounts[0]})
        })
        ethereum.on("accountsChanged", 
            (accounts: string[]) =>{
                setState({account: accounts[0]})
            })
    }, [setState])

    async function handleClick() {
        setLoading(true)
        if (!state.account){
            return 'There is no account'    
        }
        const response = await fetch(`http://localhost:3000//network/${id}/faucet/${state.account}`)
        const transaction = await response.json() as object | null
        setTx(transaction)
        setLoading(false)
    }
    
    return(
        <div>
            <h2>
                { state.account ? 
                    <p>Account: {state.account}  </p> :
                    <p>No account information</p>
                }
            </h2>
            <button onClick={async () => handleClick()} disabled={loading}>
                Ask for funds
            </button>
            { tx && <p>Response: {JSON.stringify(tx)} </p>}
        </div>
    )
}
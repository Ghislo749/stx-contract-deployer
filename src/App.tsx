import { openContractDeploy } from '@stacks/connect';
import { PostConditionMode } from '@stacks/transactions';
import { useState } from 'react';
import { AppConfig, UserSession, showConnect } from '@stacks/connect';
import { STACKS_MAINNET, STACKS_TESTNET } from '@stacks/network';

import './App.css';

import moonLogo from './assets/moonlabsLogo.png'

interface FinishData {
  txId: string;
  txRaw: string;
}

const appConfig = new AppConfig(['store_write', 'publish_data']);
const userSession = new UserSession({ appConfig });

function App() {
  const [authenticated, setAuthenticated] = useState(false);
  const [userPrincipal, setUserPrincipal] = useState('');
  const [testnetUserPrincipal, setTestnetUserPrincipal] = useState('');
  const [contractCode, setContractCode] = useState('');
  const [contractName, setContractName] = useState('');
  const [isMainnet, setIsMainnet] = useState(true);

  // ------------------------------------------------------------------------------------------------------------------- //
  // ----------------------- //
  //    Connect Functions    //
  // ----------------------- //

  async function authenticate() {
    showConnect({
      appDetails: {
        name: 'Moonlabs',
        icon: moonLogo,
      },
      redirectTo: '/',
      onFinish: () => {
        setAuthenticated(true);
        const userData = userSession.loadUserData();
        setUserPrincipal(userData?.profile?.stxAddress.mainnet);
        setTestnetUserPrincipal(userData?.profile?.stxAddress.testnet);
      },
      userSession: userSession,
    });
  }

  // ------------------------------------------------------------------------------------------------------------------- //
  // ----------------------- //
  //    Deploy Functions     //
  // ----------------------- //

  const handleDeploy = async () => {
    if (!contractCode.trim() || !contractName.trim()) {
      alert('Please provide both the contract name and contract code.');
      return;
    }

    try {
      await deployContract();
    } catch (error) {
      console.error(error);
    }
  };

  const deployContract = async () => {
    const network = isMainnet ? STACKS_MAINNET : STACKS_TESTNET;

    const options = {
      contractName: contractName.trim(),
      codeBody: contractCode.trim(),
      appDetails: {
        name: 'Moonlabs',
        icon: moonLogo,
      },
      network: network,
      onFinish: (data: FinishData) => {
        console.log('Transaction ID:', data.txId);
        console.log('Raw transaction:', data.txRaw);
        const chain = isMainnet ? 'mainnet' : 'testnet';
        const explorerTransactionUrl = `https://explorer.stacks.co/txid/${data.txId}?chain=${chain}`;
        const receiptTransactionUrl = `https://api.${chain}.hiro.so/extended/v1/tx/${data.txId}`;
        console.log('View transaction in explorer:', explorerTransactionUrl);
        console.log('View transaction receipt:', receiptTransactionUrl);
      },
    };

    await openContractDeploy({
      ...options,
      postConditionMode: PostConditionMode.Allow,
    });
  };


  return (
    <div className="container">
      <div className="connect-wrapper">
        {authenticated ? (
          <div className="connect-h-wrapper">
            <div className="connect-button" onClick={authenticate}>
              {isMainnet
                ? `${userPrincipal.slice(0, 6)}...${userPrincipal.slice(-4)}`
                : `${testnetUserPrincipal.slice(0, 6)}...${testnetUserPrincipal.slice(-4)}`}
            </div>
          </div>
        ) : (
          <div className="connect-button" onClick={authenticate}>
            Connect
          </div>
        )}
      </div>

      {authenticated && (
        <div className="deploy-wrapper">
          <div className="toggle-wrapper">
            <label className="toggle-label">
              <input
                type="checkbox"
                checked={isMainnet}
                onChange={(e) => setIsMainnet(e.target.checked)}
              />
              <span className="toggle-slider" />
              <div style={{marginTop: '10px'}}>{isMainnet ? 'Mainnet' : 'Testnet'}</div>
            </label>
            
          </div>
          <div className="input-group">
            <label htmlFor="contract-name">Contract Name:</label>
            <input
              id="contract-name"
              type="text"
              placeholder="Enter contract name"
              value={contractName}
              onChange={(e) => {
                const value = e.target.value;
                if (/^[a-zA-Z0-9-]*$/.test(value)) {
                  setContractName(value);
                }
              }}
            />
          </div>
          <div className="input-group">
            <label htmlFor="contract-code">Contract Code:</label>
            <textarea
              id="contract-code"
              placeholder="Paste your contract code here"
              value={contractCode}
              onChange={(e) => setContractCode(e.target.value)}
              rows={20}
              cols={80}
            />
          </div>
          <div className="submit-button" onClick={handleDeploy}>
            DEPLOY
          </div>
        </div>
      )}
    </div>
  );
}

export default App;

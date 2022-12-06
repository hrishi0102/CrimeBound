import { useEffect, useState } from "react";
import "./App.css";
import { ethers } from "ethers";
import sbtContract from "./ethereum/sbt";
import { create as ipfsHttpClient } from "ipfs-http-client";

const projectId = '2IQSkxfdw8MFjp3naF8d63FXrzz';
const projectSecretKey = '70df5ccae147c222655a4383541a212e';
const authorization = "Basic " + btoa(projectId + ":" + projectSecretKey);

function App() {
  const [walletAddress, setWalletAddress] = useState("");
  const [signer, setSigner] = useState();
  const [SbtContract, setSbtContract] = useState();
  const [SendSuccess, setSendSuccess] = useState("");
  const [SendError, setSendError] = useState("");
  const [TransactionData, setTransactionData] = useState();

  const [uploadedImages, setUploadedImages] = useState();
  const [Inputname, setName] = useState();
  const [Inputdesc, setDesc] = useState();
  const [baseUri, setUri] = useState();
  //const [flg, setflg] = useState(0);

  const ipfs = ipfsHttpClient({
    url: "https://ipfs.infura.io:5001/api/v0",
    headers: {
      authorization,
    },
  });

  const onSubmitHandler = async (event) => {
    event.preventDefault();
    const form = event.target;
    const name = event.target.name.value;
    const desc = event.target.desc.value;
    const files = form[0].files;

    if (!files || files.length === 0) { 
      return alert("No files selected");
    }
  
    const file = files[0];
    
    // upload files
    const result = await ipfs.add(file);
    setUploadedImages("https://skywalker.infura-ipfs.io/ipfs/"+result.path);
    setName(String(name));
    setDesc(String(desc));
    form.reset();
    
    const updatedJSON = `{
      "name": "${Inputname}",
      "description": "${Inputdesc}",
      "image": "${uploadedImages}"
    }`
      
    const DataStorage = async (event) => {
      const ans = await ipfs.add(updatedJSON);
      setUri(String(ans.path));
    }
    DataStorage()
    
  };

  useEffect(() => {
    getCurrentWalletConnected();
    addWalletListener();
  }, [walletAddress]);

  const connectWallet = async () => {
    if (typeof window != "undefined" && typeof window.ethereum != "undefined") {
      try {
        /* get provider */
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        /* get accounts */
        const accounts = await provider.send("eth_requestAccounts", []);
        /* get signer */
        setSigner(provider.getSigner());
        /* local contract instance */
        setSbtContract(sbtContract(provider));
        /* set active wallet address */
        setWalletAddress(accounts[0]);
      } catch (err) {
        console.error(err.message);
      }
    } else {
      /* MetaMask is not installed */
      console.log("Please install MetaMask");
    }
  };

  const getCurrentWalletConnected = async () => {
    if (typeof window != "undefined" && typeof window.ethereum != "undefined") {
      try {
        /* get provider */
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        /* get accounts */
        const accounts = await provider.send("eth_accounts", []);
        if (accounts.length > 0) {
          /* get signer */
          setSigner(provider.getSigner());
          /* local contract instance */
          setSbtContract(sbtContract(provider));
          /* set active wallet address */
          setWalletAddress(accounts[0]);
        } else {
          console.log("Connect to MetaMask using the Connect Wallet button");
        }
      } catch (err) {
        console.error(err.message);
      }
    } else {
      /* MetaMask is not installed */
      console.log("Please install MetaMask");
    }
  };

  const addWalletListener = async () => {
    if (typeof window != "undefined" && typeof window.ethereum != "undefined") {
      window.ethereum.on("accountsChanged", (accounts) => {
        setWalletAddress(accounts[0]);
        console.log(accounts[0]);
      });
    } else {
      /* MetaMask is not installed */
      setWalletAddress("");
      console.log("Please install MetaMask");
    }
  };

  const sendCBT = async () => {
    setSendError("");
    setSendSuccess("");
    try {
      const sbtwithSigner = SbtContract.connect(signer);
      const resp = await sbtwithSigner.safeMint(
        document.getElementById("mintadd").value,
        baseUri
        //"Qmb7Evd5LQeKgKn43WZy6owoTa6mJayX7YvGodpqjTn2Fm"
      );
      console.log('baseUri');
      console.log(baseUri);
      setSendSuccess("Successful");
      setTransactionData(resp.hash);
    } catch (err) {
      setSendError(err.message);
    }
  };

  return (
    <div>
      <nav className="navbar">
        <div className="container">
          <div className="navbar-brand">
            <h1 className="navbar-item is-size-4">CrimeBound</h1>
          </div>
          <div id="navbarMenu" className="navbar-menu">
            <div className="navbar-end is-align-items-center">
              <button
                className="button is-white connect-wallet"
                onClick={connectWallet}
              >
                <span className="is-link has-text-weight-bold">
                  {walletAddress && walletAddress.length > 0
                    ? `Connected: ${walletAddress.substring(
                        0,
                        6
                      )}...${walletAddress.substring(38)}`
                    : "Connect Wallet"}
                </span>
              </button>
            </div>
          </div>
        </div>
      </nav>
      <section className="hero is-fullheight">
        <div className="faucet-hero-body">
          <div className="container has-text-centered main-content">
            {/* <h2 className="title is-1"></h2> */}
            <div className="mt-5">
              {SendError && <div className="withdraw-error">{SendError}</div>}
              {SendSuccess && (
                <div className="withdraw-success">{SendSuccess}</div>
              )}{" "}
            </div>
            <div className="box address-box">
            <div className="container">
            <h1>IPFS uploader</h1> <br />
            <form onSubmit={onSubmitHandler}>
                <label for="file-upload" class="custom-file-upload">
                  Select File
                </label>
                <input id="file-upload" type="file" name="file" />
                <br />
                <label for="name" class="custom-name">
                  Enter Name of your CBT
                </label>
                <input type="text" id="name" name="name" />
                <br />
                <label for="description" class="custom-description">
                  Enter Description of your CBT
                </label>
                <input type="text" id="desc" name="desc" />
                <br />
                <button className="button" type="submit">
                  Submit Data
              </button>
            </form>
          </div>
          <br />
              <div className="columns">
                <div className="column is-four-fifths">
                  <input
                    className="input is-medium"
                    type="text"
                    id="mintadd"
                    placeholder="Enter wallet address (0x...)"
                  />
                  <button
                    className="button is-link is-medium"
                    onClick={sendCBT}
                    disabled={walletAddress ? false : true}
                  >
                    Send CBT
                  </button>
                </div>
              </div>
              <article className="panel is-grey-darker">
                <p className="panel-heading">Transaction Data</p>
                <div className="panel-block">
                  <p>
                    {TransactionData
                      ? `Transaction hash: ${TransactionData}`
                      : " "}
                  </p>
                </div>
              </article>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default App;

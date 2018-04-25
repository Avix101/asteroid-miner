//Construct the main game window
const GameWindow = (props) => {
  return (
    <canvas id="viewport" width={props.width} height={props.height}></canvas>
  );
};

//Constructs a window for purchasing / agreeing to contracts
const ContractWindow = (props) => {
  return (
    <div className="container">
      <div className="jumbotron">
        <h1 className="display-3">Contract Selection:</h1>
        <p className="lead">Choose wisely.</p>
        <hr className="my-4" />
        
        <h2>Standard Contracts</h2>
        <p className="lead">100% of the profits go to you upon completely mining the asteroid.</p>
        <div id="basicContracts"></div>
        <hr />
        
        <h2>Partner Contracts</h2>
        <p className="lead">Profits are split evenly between you and all partners.</p>
        <div id="partnerContracts"></div>
        <hr />
        
        <h2>Sub Contracts</h2>
        <p className="lead">You will be paid the specified amount once you deliver the required number of clicks.</p>
        <div id="subContracts"></div>
      </div>
    </div>
  );
};

//Helper function to start mining for a sub contract
const startSubMine = (e) => {
  const subContractId = e.target.getAttribute("data-contract-id");
  
  if(!subContractId){
    return;
  }
  
  window.location = "#miner";
  socket.emit('mineSub', { subContractId });
};

//Helper function to start mining
const startMine = (e) => {
  const contractId = e.target.getAttribute("data-contract-id");
  
  if(!contractId){
    return;
  }
  
  window.location.hash = "#miner";
  socket.emit('mine', { contractId });
};

//Constructs a window displaying the user's contracts
const MyContractsWindow = (props) => {
  return (
    <div className="container">
      <div className="jumbotron">
        <h1>My Contracts</h1>
        <p className="lead">Contracts you own</p>
        <div id="myContracts"></div>
        <hr />
      
        <h1>Sub Contracts</h1>
        <p className="lead">Monitor your sub contracts</p>
        <div>  
          <button onClick={renderSubContractModal}
            className="btn btn-lg btn-primary fullButton">Draft Sub Contract</button>
        </div>
        <div id="mySubContracts"></div>
        <hr />
      
      </div>
    </div>
  );
}

//Helper method to buy a standard contract
const purchaseContract = (e) => {
  const asteroidClass = e.target.getAttribute('data-purchase');
  
  if(!asteroidClass){
    return;
  }
  
  getTokenWithCallback((csrfToken) => {
    const data = `ac=${asteroidClass}&_csrf=${csrfToken}`;
    sendAjax('POST', '/buyAsteroid', data, (data) => {
      handleSuccess(data.message);
      renderContracts();
    });
  });
};

const joinContractAsPartner = (e) => {
    const contractId = e.target.getAttribute('data-contractId');
    
    if(!contractId){
        return;
    }
    
  getTokenWithCallback((csrfToken) => {
    const data = `id=${contractId}&_csrf=${csrfToken}`;
    sendAjax('POST', '/joinContractAsPartner', data, (data) => {
      handleSuccess(data.message);
      renderContracts();
    });
  });
}

//Helper method to accept a sub contract
const acceptSubContract = (e) => {
  const subContractId = e.target.getAttribute('data-accept');
  
  if(!subContractId){
    return;
  }
  
  getTokenWithCallback((csrfToken) => {
    const data = `id=${subContractId}&_csrf=${csrfToken}`;
    sendAjax('POST', '/acceptSubContract', data, (data) => {
      handleSuccess(data.message);
      renderContracts();
    });
  });
};

//Handle a request to create a sub contract
const handleSubContractSubmit = (e) => {
  
  if(e){
    e.preventDefault();
  }
  
  const clickNum = document.querySelector("#clickNum");
  
  if(clickNum.value < 1){
    handleError("Number of clicks must be at least 1");
    return false;
  }
  
  sendAjax('POST', $("#subContractForm").attr("action"), $("#subContractForm").serialize(), (data) => {
    hideModal();
    handleSuccess(data.message);
    renderMyContractsPanel();
  });
  
  return false;
}

// Buy a contract as a partner one
const purchaseAsPartnerContract = (e) => {
  const asteroidClass = e.target.getAttribute('data-purchase');
  
  if(!asteroidClass){
    return;
  }
  
  getTokenWithCallback((csrfToken) => {
    const data = `ac=${asteroidClass}&_csrf=${csrfToken}`;
    sendAjax('POST', '/buyPartnerAsteroid', data, (data) => {
      handleSuccess(data.message);
      renderContracts();
    });
  });
}

//Builds a list of contracts that the user owns
const MyContracts = (props) => {
  
  const subContracts = props.data.subContracts.map((contract, index) => {
    return (
      <li className="list-group-item d-flex">
        <div className="card border-info mb-3 contractCard">
          <div className="card-header justify-content-center">
            Asteroid Class: {contract.asteroid.classname.toUpperCase()}
            
            <div className="vAlign pillContainer">
              <span className="badge badge-info badge-pill">#{index + 1}</span>
            </div>
          </div>
          <div className="card-body">
            <div className="container">
              <div className="row">
                <div className="col-sm-12 text-center">
                  <p className="card-text">Contract Progress: {contract.progress} / {contract.clicks}</p>
                  <p className="card-text">Asteroid Progress: {contract.asteroid.progress} / {contract.asteroid.toughness}</p>
                  <button data-contract-id={contract.subContractId} onClick={startSubMine}
                    className="btn btn-lg btn-info fullButton">Mine</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </li>
    );
  });
  
  const contracts = props.data.contracts.map((contract, index) => {
    return (
      <li className="list-group-item d-flex">
        <div className="card border-primary mb-3 contractCard">
          <div className="card-header justify-content-center">
            Asteroid Class: {contract.asteroid.classname.toUpperCase()}
            
            <div className="vAlign pillContainer">
              <span className="badge badge-primary badge-pill">#{index + 1}</span>
            </div>
          </div>
          <div className="card-body">
            <div className="container">
              <div className="row">
                <div className="col-sm-12 text-center">
                  <p className="card-text">Progress: {contract.asteroid.progress} / {contract.asteroid.toughness}</p>
                  <button data-contract-id={contract.contractId} onClick={startMine}
                    className="btn btn-lg btn-primary fullButton">Mine</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </li>
    );
  });
  
  return (
    <ul className="list-group">
      {subContracts}
      {contracts}
    </ul>
  );
};

//Builds a list of basic contracts and ads them to the basic contracts section
const BasicContracts = (props) => {
  
  const contractKeys = Object.keys(props.contracts);
  const contracts = [];
  for(let i = 0; i < contractKeys.length; i++){
    const contract = props.contracts[contractKeys[i]];
    
    const rewardKeys = Object.keys(contract.rewardChances);
    const rewards = [];
    for(let i =0; i < rewardKeys.length; i++){
      const reward = contract.rewardChances[rewardKeys[i]];
      rewards.push(
        <li className="card-text">{rewardKeys[i]}: {reward.min}-{reward.max}</li>
      );
    }
    
    contracts.push(
      <li className="list-group-item d-flex">
        <div className="card border-primary mb-3 contractCard">
          <div className="card-header justify-content-center">
            {contract.name}
            
            <div className="vAlign pillContainer">
              <span className="badge badge-primary badge-pill">#{i + 1}</span>
            </div>
          </div>
          <div className="card-body">
            <div className="container">
              <div className="row">
                <div className="col-sm-4 text-center">
                  <p className="card-text">Price: {contract.price} Galaxy Bucks</p>
                  <p className="card-text">Toughness: {contract.toughness} Clicks</p>
                  <img className="imagePreview" src={`/assets/img/asteroids/${contract.asteroidClass}01.png`} alt="Asteroid Sample" />
                </div>
                <div className="col-sm-4">
                  <p className="card-text">Potential Rewards:
                    <ul>
                      {rewards}
                    </ul>
                  </p>
                </div>
                <div className="col-sm-4 text-center justify-content-center vAlign">
                  <p className="contractButtonContainer">
                    <button data-purchase={contract.asteroidClass} onClick={purchaseContract}
                      className="btn btn-lg btn-primary normalWhitespace">Purchase Asteroid ({contract.price} GB)</button>
                    <button data-purchase={contract.asteroidClass} onClick={purchaseAsPartnerContract}
                      className="btn btn-lg btn-primary normalWhitespace">Purchase As Partner ({contract.price} GB)</button>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </li>
    );
  }
  
  return (
    <div id="basicContractList">
      <ul className="list-group">
        {contracts}
      </ul>
    </div>
  );
};

const PartnerContracts = (props) => {
    console.log(props);
  const openContracts = props.contracts;    
  const contracts = [];
    
    console.log('openContracts length: ' + openContracts.length);
  for(let i = 0; i < openContracts.length; i++){
    const contract = openContracts[i];

    contracts.push(
      <li className="list-group-item d-flex">
        <div className="card border-primary mb-3 contractCard">
          <div className="card-header justify-content-center">
            {contract.asteroid.name}
          </div>
          <div className="card-body">
            <div className="container">
              <div className="row">
                <div className="col-sm-4 text-center">
                  <p className="card-text">Slots: {contract.partners.length} / {contract.maximumPartners}</p>
                  <p className="card-text">Toughness: {contract.asteroid.toughness} Clicks</p>
                  <img className="imagePreview" src={`${contract.asteroid.imageFile}`} alt="Asteroid Sample" />
                </div>
                <div className="col-sm-4 text-center justify-content-center vAlign">
                  <p className="contractButtonContainer">
                    <button data-contractID={contract._id} onClick={joinContractAsPartner}
                      className="btn btn-lg btn-primary normalWhitespace">Join as Partner (? GB)</button>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </li>
    );
  }
  
  return (
    <div id="basicContractList">
      <ul className="list-group">
        {contracts}
      </ul>
    </div>
  );
};

const SubContracts = (props) => {
  
  const contractKeys = Object.keys(props.contracts);
  const contracts = [];
  for(let i = 0; i < contractKeys.length; i++){
    const contract = props.contracts[contractKeys[i]];
    
    const rewardKeys = Object.keys(contract.rewards);
    const rewards = [];
    for(let i = 0; i < rewardKeys.length; i++){
      const reward = contract.rewards[rewardKeys[i]];
      rewards.push(
        <li className="card-text">{rewardKeys[i]}: {contract.rewards[rewardKeys[i]]}</li>
      );
    }
    
    contracts.push(
      <li className="list-group-item d-flex">
        <div className="card border-info mb-3 contractCard">
          <div className="card-header justify-content-center">
            {contract.name}
            
            <div className="vAlign pillContainer">
              <span className="badge badge-info badge-pill">#{i + 1}</span>
            </div>
          </div>
          <div className="card-body">
            <div className="container">
              <div className="row">
                <div className="col-sm-4 text-center">
                  <p className="card-text">Contractor: {contract.owner}</p>
                  <p className="card-text">Required: {contract.clicks} Clicks</p>
                  <img className="imagePreview" src={`/assets/img/asteroids/${contract.asteroidClass}01.png`} alt="Asteroid Sample" />
                </div>
                <div className="col-sm-4">
                  <p className="card-text">Rewards:
                    <ul>
                      {rewards}
                    </ul>
                  </p>
                </div>
                <div className="col-sm-4 text-center justify-content-center vAlign">
                  <p className="contractButtonContainer">
                    <button data-accept={contract.subContractId} onClick={acceptSubContract}
                      className="btn btn-lg btn-info normalWhitespace">Accept Sub Contract</button>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </li>
    );
  }
  
  return (
    <div id="basicContractList">
      <ul className="list-group">
        {contracts}
      </ul>
    </div>
  );
};

const MarketWindow = (props) => {
  return (
    <div className="container">
      <div className="jumbotron">
        <h1 className="display-3">Sell Resources:</h1>
        <p className="lead">In need of some Galaxy Bucks? Sell your hard-earned loot!</p>
        <hr className="my-4" />
      </div>
    </div>
  );
};

const UpgradesWindow = (props) => {
  return (
    <div className="container">
      <div className="jumbotron">
        <h1 className="display-3">Mining Upgrades:</h1>
        <p className="lead">Purchase these to make mining easier!</p>
        <hr className="my-4" />
      </div>
    </div>
  );
};

const HighscoreWindow = (props) => {
  return (
    <div className="container">
      <div className="jumbotron">
        <h1 className="display-3">Top Miners:</h1>
        <p className="lead">Only the best of the best could ever hope to be on this page!</p>
        <hr className="my-4" />
      </div>
    </div>
  );
};

const ProfileWindow = (props) => {
  return (
    <div className="container">
      <div className="jumbotron">
        <h1 className="display-3">Personal Profile:</h1>
        <p className="lead">Miner ID: (#) Logs & Account data (SYSTEM INFO)</p>
        <hr className="my-4" />
      </div>
    </div>
  );
};

//Helper method to request that the user's account be credited with Galaxy Bucks
const getGalaxyBucks = (e) => {
  const amount = e.target.getAttribute('data-gb');
  
  if(!amount){
    return;
  }
  
  getTokenWithCallback((csrfToken) => {
    const data = `gb=${amount}&_csrf=${csrfToken}`;
    sendAjax('POST', '/getGalaxyBucks', data, (data) => {
      handleSuccess(data.message);
    });
  });
};

//Construct a window for buying galaxy bucks (the best currency in the universe!
const PayToWinWindow = (props) => {
  return (
    <div className="container">
      <div className="row justify-content-center">
        <h1>Galaxy Bucks</h1>
      </div>
      <div className="row justify-content-center">
        <p className="lead">Only the Best Currency in the Universe!</p>
      </div>
      <div className="row justify-content-center">
        <div className="col-lg-12">
          <div className="jumbotron justify-content-center">
            <h2 className="text-success">Free</h2>
            <hr />
            <p className="lead">Watch an advertisement from our sponsor Robo Corp&reg;,
            to earn some Galaxy Bucks for free! (Note* Payment of 30 seconds of your time
            is required by law in order to qualify for this Galaxy Bucks offer)</p>
            <hr />
            <div className="text-center">
              <button className="btn btn-lg btn-primary" onClick={loadAd}>Watch Ad</button>
            </div>
          </div>
        </div>
      </div>
      <div className="row justify-content-center">
        <div className="col-lg-4">
          <div className="jumbotron justify-content-center">
            <h2 className="text-success">Tier 1</h2>
            <hr />
            <ul className="lead">
              <li>Cost: $1</li>
              <li>GBs: 1000</li>
              <li>Value: Good</li>
            </ul>
            <hr />
            <div className="text-center">
              <button onClick={getGalaxyBucks} data-gb="1000" className="btn btn-lg btn-primary">Purchase</button>
            </div>
          </div>
        </div>
        <div className="col-lg-4">
          <div className="jumbotron justify-content-center">
            <h2 className="text-success">Tier 2</h2>
            <hr />
            <ul className="lead">
              <li>Cost: $5</li>
              <li>GBs: 6000</li>
              <li>Value: Great</li>
            </ul>
            <hr />
            <div className="text-center">
              <button onClick={getGalaxyBucks} data-gb="6000" className="btn btn-lg btn-primary">Purchase</button>
            </div>
          </div>
        </div>
        <div className="col-lg-4">
          <div className="jumbotron justify-content-center">
            <h2 className="text-success">Tier 3</h2>
            <hr />
            <ul className="lead">
              <li>Cost: $20</li>
              <li>GBs: 25000</li>
              <li>Value: Best</li>
            </ul>
            <hr />
            <div className="text-center">
              <button onClick={getGalaxyBucks} data-gb="25000" className="btn btn-lg btn-primary">Purchase</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

//Construct an ad modal to let the user watch an ad to earn Galaxy Bucks
const AdModal = (props) => {
  
  let modalBody;
  
  if(props.render){
    const dimensions = calcDisplayDimensions();
    const ratio = Math.min(window.innerHeight * 0.5 / dimensions.height, 1);
    dimensions.width *= ratio;
    dimensions.height *= ratio;
    modalBody = (
      <div className="justify-content-center text-center">
        <canvas id="adViewport" className="animateExpand" width={dimensions.width} height={dimensions.height}></canvas>
      </div>
    );
  } else {
    modalBody = <p>Loading Robo Corp&reg; Ad... <span className="fas fa-sync fa-spin"></span></p>;
  }
  
  const completeAd = (e) => {
    hideModal(e);
    getGalaxyBucks(e);
  }
  
  return (
    <div id="adModal" className="modal show" tabindex="-1" role="dialog">
      <div id="pageMask"></div>
      <div className="modal-dialog" role="document">
        <div className="modal-content">
          <div className="modal-header">
            <h1 className="modal-title">Ad from Robo Corp&reg;</h1>
            <button className="close" data-dismiss="modal" aria-label="Close" onClick={hideModal}>
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div className="modal-body">
            {modalBody}
          </div>
          <div className="modal-footer">
            <button id="payoutButton" data-gb="50" className="btn btn-lg btn-primary"
              data-dismiss="modal" onClick={completeAd}>Collect 50 GBs</button>
          </div>
        </div>
      </div>
    </div>
  );
};

//Contruct a modal to handle drafting a sub contract
const SubContractModal = (props) => {
  
  const contractOptions = props.contracts.map((contract) => {
    return (
      <option value={contract.contractId}>Class {contract.asteroid.classname.toUpperCase()} asteroid
       -> Progress: {contract.asteroid.progress} / {contract.asteroid.toughness}
      </option>
    );
  });
  
  return (
    <div id="subContractModal" className="modal show" tabindex="-1" role="dialog">
      <div id="pageMask"></div>
      <div className="modal-dialog" role="document">
        <div className="modal-content">
          <div className="modal-header">
            <h1 className="modal-title">
              Sub Contract Draft <span className="fas fa-edit"></span>
            </h1>
            <button className="close" data-dismiss="modal" aria-label="Close" onClick={hideModal}>
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div className="modal-body">
            <div className="container">
              <div className="row">
                <div className="col-xl-3"></div>
                <div className="col-xl-6">
                  <form id="subContractForm" className="form" onSubmit={handleSubContractSubmit}
                    action="/createSubContract"
                  >
                    <label htmlFor="contract" className="form-input-label">Contract</label>
                    <select name="contract" className="custom-select">
                      {contractOptions}
                    </select>
                    <label htmlFor="clicks" className="form-input-label">Clicks Requested</label>
                    <input id="clickNum" name="clicks" className="form-control" type="number" min="1" max="1000000" />
                    <label className="form-input-label">Resources Given</label>
                    <div className="row justify-content-center">
                      <div className="col-sm-4 text-center">
                        <label className="form-input-label">Galaxy Bucks: </label>
                      </div>
                      <div className="col-sm-8">
                        <input name="gb" className="form-control" type="number" min="0" max="1000000" />
                      </div>
                    </div>
                    <hr />
                    <div className="row justify-content-center">
                      <div className="col-sm-4 text-center">
                        <label className="form-input-label">Iron: </label>
                      </div>
                      <div className="col-sm-8">
                        <input name="iron" className="form-control" type="number" min="0" max="1000000" />
                      </div>
                    </div>
                    <hr />
                    <div className="row justify-content-center">
                      <div className="col-sm-4 text-center">
                        <label className="form-input-label">Copper: </label>
                      </div>
                      <div className="col-sm-8">
                        <input name="copper" className="form-control" type="number" min="0" max="1000000" />
                      </div>
                    </div>
                    <hr />
                    <div className="row justify-content-center">
                      <div className="col-sm-4 text-center">
                        <label className="form-input-label">Sapphires: </label>
                      </div>
                      <div className="col-sm-8">
                        <input name="sapphire" className="form-control" type="number" min="0" max="1000000" />
                      </div>
                    </div>
                    <hr />
                    <div className="row justify-content-center">
                      <div className="col-sm-4 text-center">
                        <label className="form-input-label">Emeralds: </label>
                      </div>
                      <div className="col-sm-8">
                        <input name="emerald" className="form-control" type="number" min="0" max="1000000" />
                      </div>
                    </div>
                    <hr />
                    <div className="row justify-content-center">
                      <div className="col-sm-4 text-center">
                        <label className="form-input-label">Rubies: </label>
                      </div>
                      <div className="col-sm-8">
                        <input name="ruby" className="form-control" type="number" min="0" max="1000000" />
                      </div>
                    </div>
                    <hr />
                    <div className="row justify-content-center">
                      <div className="col-sm-4 text-center">
                        <label className="form-input-label">Diamonds: </label>
                      </div>
                      <div className="col-sm-8">
                        <input name="diamond" className="form-control" type="number" min="0" max="1000000" />
                      </div>
                    </div>
                    <input className="hidden" name="_csrf" value={props.csrf} />
                  </form>
                </div>
                <div className="col-xl-3"></div>
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button id="cancelButton" className="btn btn-lg btn-danger"
              data-dismiss="modal" onClick={hideModal}>Cancel</button>
            <button id="subContractSubmit" className="btn btn-lg btn-primary"
              data-dismiss="modal" onClick={handleSubContractSubmit}>Create Sub Contract</button>
          </div>
        </div>
      </div>
    </div>
  );
};

const ProgressPanel = (props) => {
  
  const progressWidth = {width: `${(props.current / props.total) * 100}%`};
  
  return (
    <div className="container">
      <div className="jumbotron">
        <h1>Progress</h1>
        <hr className="my-4" />
        <p className="lead">Clicks: {props.current}/{props.total}</p>
        <div className="progress">
          <div className="progress-bar progress-bar-striped progress-bar-animated bg-success"
            role="progressbar"
            aria-value={props.current}
            aria-valuemin="0"
            aria-valuemax={props.total}
            style={progressWidth}
          ></div>
        </div>
      </div>
    </div>
  );
}

//Render the main game window
const renderGame = (width, height) => {
  ReactDOM.render(
    <GameWindow width={width} height={height} />,
    document.querySelector("#main")
  );
  
  //Render my contracts panel
  renderMyContractsPanel();
  
  //Hook up viewport (display canvas to JS code)
  canvas = document.querySelector("#viewport");
  ctx = canvas.getContext('2d');
  
  //Add event listeners
  canvas.addEventListener('click', processClick);
  canvas.addEventListener('mousedown', disableExtraActions);
};

//Load an ad to display to the user
const loadAd = () => {
  renderAd(false);
  const payoutButton = document.querySelector("#payoutButton");
  payoutButton.disabled = true;
  
  sendAjax('GET', '/getAd', null, (result) => {
		processAd(result.ad);
	});
}

//Render the ad modal (and show an ad to the user)
const renderAd = (render) => {
  ReactDOM.render(
    <AdModal render={render} />,
    document.querySelector("#adContainer")
  );
  
  if(render){
    adCanvas = document.querySelector("#adViewport");
    adCtx = adCanvas.getContext('2d');
  }
  
  const modal = document.querySelector("#adContainer div");
  
  if(!modal){
    return;
  }
  
  modal.classList.remove("hide-anim");
  modal.classList.add("show");
}

//Hide the ad modal
const hideModal = (e) => {
  const adModal = document.querySelector("#adContainer");
  const subContractModal = document.querySelector("#subContractModalContainer");
  
  if(!adModal && !subContractModal){
    return;
  }
  
  if(e){
    if(adModal.contains(e.target)){
    
      if(adAudio){
        adAudio.pause();
        adAudio.currenTime = 0;
      }
      
      showingAd = false;
      document.querySelector("#adContainer div").classList.add("hide-anim");
    } else if(subContractModal.contains(e.target)){
      document.querySelector("#subContractModalContainer div").classList.add("hide-anim");
    }
  } else {
    if(adModal.querySelector('div')){
      document.querySelector("#adContainer div").classList.add("hide-anim");
    }
    
    if(subContractModal.querySelector('div')){
      document.querySelector("#subContractModalContainer div").classList.add("hide-anim");
    }
  }
};

//Render the sub contract modal
const renderSubContractModal = () => {
  getTokenWithCallback((csrfToken) => {
    ReactDOM.render(
      <SubContractModal contracts={availableContracts} csrf={csrfToken} />,
      document.querySelector("#subContractModalContainer")
    );
    
    const modal = document.querySelector("#subContractModalContainer div");
    
    if(!modal){
      return;
    }
    
    modal.classList.remove("hide-anim");
    modal.classList.add("show");
  });
  
};

//Render the galaxy bucks purchase window
const renderPayToWin = () => {
  ReactDOM.render(
    <PayToWinWindow />,
    document.querySelector("#main")
  );
};

//Render the asteroid's progress panel
const renderProgressPanel = (current, total) => {
  ReactDOM.render(
    <ProgressPanel current={current} total={total} />,
    document.querySelector("#rightPanel")
  );
};

//Populate contract window with returned contracts
const populateContractsWindow = (data) => {
  //console.log(data);
  ReactDOM.render(
    <BasicContracts contracts={data.basicContracts} />,
    document.querySelector("#basicContracts")
  );
};

//Populate contract window with returned sub contracts
const populateSubContractsWindow = (data) => {
  console.log(data);
  ReactDOM.render(
    <SubContracts contracts={data.subContracts} />,
    document.querySelector("#subContracts")
  );
}

// To Do: Make PartnerContracts react object
const populatePartnerContractsWindow = (data) => {
    console.log(data.openContracts);
    ReactDOM.render(
    <PartnerContracts contracts={data.openContracts} />,
    document.querySelector("#partnerContracts")
  );
}

//Populate already owned contracts with data sent from server
const populateMyContractsWindow = (data) => {
  console.log(data);
  ReactDOM.render(
    <MyContracts data={data} />,
    document.querySelector("#myContracts")
  );
};

//Render the 'MyContracts' side panel
let availableContracts = [];
const renderMyContractsPanel = () => {
  ReactDOM.render(
    <MyContractsWindow />,
    document.querySelector("#leftPanel")
  );
  
  sendAjax('GET', '/getMyContracts', null, (result) => {
    availableContracts = result.contracts;
    populateMyContractsWindow(result);
  });
};

//Add more handlers and components if necessary
const renderContracts = () => {
  ReactDOM.render(
    <ContractWindow />,
    document.querySelector("#main")
  );
  
  renderMyContractsPanel();
  
  sendAjax('GET', '/getContracts', null, (result) => {
		populateContractsWindow(result);
	});
  sendAjax('GET', '/getPartnerContracts', null, (result) => {
		populatePartnerContractsWindow(result);
	});
  sendAjax('GET', '/getSubContracts', null, (result) => {
    populateSubContractsWindow(result);
  });
};

const renderMarket = () => {
  ReactDOM.render(
    <MarketWindow />,
    document.querySelector("#main")
  );
};

const renderUpgrades = () => {
  ReactDOM.render(
    <UpgradesWindow />,
    document.querySelector("#main")
  );
};

const renderHighscores = () => {
  ReactDOM.render(
    <HighscoreWindow />,
    document.querySelector("#main")
  );
};

const renderProfile = () => {
  ReactDOM.render(
    <ProfileWindow />,
    document.querySelector("#main")
  );
};

//Request a newe csrf token and then execute a callback when one is retrieved
const getTokenWithCallback = (callback) => {
	sendAjax('GET', '/getToken', null, (result) => {
		if(callback){
      callback(result.csrfToken);
    }
	});
};
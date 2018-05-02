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
        <p className="lead">Partner contracts are split into 25% shares (4 shares per asteroid) on purchase,
        one of which belonging to the origial buyer. Costs and profits are split evenly between the owner and all partners.
        If you wish to claim additional shares, accept the partner contract multiple times</p>
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

const startPartnerMine = (e) => {
  const partnerContractId = e.target.getAttribute("data-contract-id");
  
  if(!partnerContractId){
    return;
  }
  
  window.location.hash = "#miner";
  socket.emit('minePartner', { partnerContractId });
}

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

//Handle a request to sell resources for Galaxy Bucks
const handleMarketSubmit = (e) => {
  e.preventDefault();
  
  sendAjax('POST', $("#marketForm").attr("action"), $("#marketForm").serialize(), (data) => {
    handleSuccess(data.message);
    socket.emit('getMyBankData');
    loadView();
  });
  
  return false;
};

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
  console.dir(props.data);
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
    const partnerContracts = props.data.partnerContracts.map((contract, index) => {
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
                  <button data-contract-id={contract.partnerContractId} onClick={startPartnerMine}
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
      {partnerContracts}
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
    for(let i = 0; i < rewardKeys.length; i++){
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
                      className="btn btn-lg btn-primary normalWhitespace">Purchase As Partner ({contract.price/4} GB)</button>
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
                      className="btn btn-lg btn-primary normalWhitespace">Join as Partner ({contract.price} GB)</button>
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

//Helper function that returns a compact version of the requested number
const compressNumber = (num) => {
  if(num > 1000000000000){
    num = `${Math.floor(num / 1000000000000)}T`;
  } else if(num > 1000000000){
    num = `${Math.floor(num / 1000000000)}B`;
  } else if(num > 1000000){
    num = `${Math.floor(num / 1000000)}M`;
  }
  
  if(Number.isNaN(num)){
    num = 0;
  }
  
  return num;
}

//Construct a window for selling resources back to the server for Galaxy Bucks
const MarketWindow = (props) => {
  
  //If the user's bank has not loaded, wait for it to do so
  if(!account.bank){
    return (
      <div className="container">
        <div className="jumbotron">
          <p className="lead">Loading account data... <span className="fas fa-sync fa-spin"></span></p>
        </div>
      </div>
    );
  }
  
  //Grab current input values to calculate potential pay
  const currentInputs = document.querySelectorAll("#marketForm input[type=number]");
  const currentValues = {};
  for(let i = 0; i < currentInputs.length; i++){
    const input = currentInputs[i];
    currentValues[input.name] = parseInt(input.value, 10);
    
    //Make sure the entered value is a number
    if(Number.isNaN(currentValues[input.name])){
      currentValues[input.name] = 0;
    }
  }
  
  //Calculate the total pay
  const totalPay = compressNumber(
    props.rates.iron * currentValues.iron +
    props.rates.copper * currentValues.copper +
    props.rates.sapphire * currentValues.sapphire +
    props.rates.emerald * currentValues.emerald +
    props.rates.ruby * currentValues.ruby +
    props.rates.diamond * currentValues.diamond
  );
  
  return (
    <div className="container">
      <div className="jumbotron">
        <h1 className="display-3">Sell Resources:</h1>
        <p className="lead">In need of some Galaxy Bucks? Sell your hard-earned loot!</p>
        <hr className="my-4" />
          <form id="marketForm" className="form" onSubmit={handleMarketSubmit}
            action="/sellResources"
          >
            <div className="row justify-content-center">
              <div className="col-sm-4 text-center">
                <p className="lead">Resources</p>
              </div>
              <div className="col-sm-4 text-center">
                <p className="lead">Amount to Sell</p>
              </div>
              <div className="col-sm-2 text-center">
                <p className="lead">Price Per (RCCTR*)</p>
              </div>
              <div className="col-sm-2 text-center">
                <p className="lead">Payment</p>
              </div>
            </div>
            <div className="row justify-content-center">
              <div className="col-sm-4 text-center flex-center border border-primary">
                <label className="form-input-label">
                  <img src={ironIcon.src} width="25" height="25" alt="" /> Iron: ({account.bank.iron})</label>
              </div>
              <div className="col-sm-4 flex-center">
                <input name="iron" className="form-control" type="number" min="0" max={account.bank.iron} />
              </div>
              <div className="col-sm-2 text-center flex-center">
                <div className="full-size border border-info flex-center">
                  <span>{props.rates.iron}x</span>
                </div>
              </div>
              <div className="col-sm-2 text-center flex-center">
                <div className="full-size border border-success flex-center">
                  <span>{compressNumber(props.rates.iron * currentValues.iron)} GB</span>
                </div>
              </div>
            </div>
            <hr />
            <div className="row justify-content-center">
              <div className="col-sm-4 text-center flex-center border border-primary">
                <label className="form-input-label">
                  <img src={copperIcon.src} width="25" height="25" alt="" /> Copper: ({account.bank.copper})</label>
              </div>
              <div className="col-sm-4">
                <input name="copper" className="form-control" type="number" min="0" max={account.bank.copper} />
              </div>
              <div className="col-sm-2 text-center flex-center">
                <div className="full-size border border-info flex-center">
                  <span>{props.rates.copper}x</span>
                </div>
              </div>
              <div className="col-sm-2 text-center flex-center">
                <div className="full-size border border-success flex-center">
                  <span>{compressNumber(props.rates.copper * currentValues.copper)} GB</span>
                </div>
              </div>
            </div>
            <hr />
            <div className="row justify-content-center">
              <div className="col-sm-4 text-center flex-center border border-primary">
                <label className="form-input-label">
                  <img src={sapphireIcon.src} width="25" height="25" alt="" /> Sapphires: ({account.bank.sapphire})</label>
              </div>
              <div className="col-sm-4">
                <input name="sapphire" className="form-control" type="number" min="0" max={account.bank.sapphire} />
              </div>
              <div className="col-sm-2 text-center flex-center">
                <div className="full-size border border-info flex-center">
                  <span>{props.rates.sapphire}x</span>
                </div>
              </div>
              <div className="col-sm-2 text-center flex-center">
                <div className="full-size border border-success flex-center">
                  <span>{compressNumber(props.rates.sapphire * currentValues.sapphire)} GB</span>
                </div>
              </div>
            </div>
            <hr />
            <div className="row justify-content-center">
              <div className="col-sm-4 text-center flex-center border border-primary">
                <label className="form-input-label">
                  <img src={emeraldIcon.src} width="25" height="25" alt="" /> Emeralds: ({account.bank.emerald})</label>
              </div>
              <div className="col-sm-4">
                <input name="emerald" className="form-control" type="number" min="0" max={account.bank.emerald} />
              </div>
              <div className="col-sm-2 text-center flex-center">
                <div className="full-size border border-info flex-center">
                  <span>{props.rates.emerald}x</span>
                </div>
              </div>
              <div className="col-sm-2 text-center flex-center">
                <div className="full-size border border-success flex-center">
                  <span>{compressNumber(props.rates.emerald * currentValues.emerald)} GB</span>
                </div>
              </div>
            </div>
            <hr />
            <div className="row justify-content-center">
              <div className="col-sm-4 text-center flex-center border border-primary">
                <label className="form-input-label">
                  <img src={rubyIcon.src} width="25" height="25" alt="" /> Rubies: ({account.bank.ruby})</label>
              </div>
              <div className="col-sm-4">
                <input name="ruby" className="form-control" type="number" min="0" max={account.bank.ruby} />
              </div>
              <div className="col-sm-2 text-center flex-center">
                <div className="full-size border border-info flex-center">
                  <span>{props.rates.ruby}x</span>
                </div>
              </div>
              <div className="col-sm-2 text-center flex-center">
                <div className="full-size border border-success flex-center">
                  <span>{compressNumber(props.rates.ruby * currentValues.ruby)} GB</span>
                </div>
              </div>
            </div>
            <hr />
            <div className="row justify-content-center">
              <div className="col-sm-4 text-center flex-center border border-primary">
                <label className="form-input-label">
                  <img src={diamondIcon.src} width="25" height="25" alt="" /> Diamonds: ({account.bank.diamond})</label>
              </div>
              <div className="col-sm-4">
                <input name="diamond" className="form-control" type="number" min="0" max={account.bank.diamond} />
              </div>
              <div className="col-sm-2 text-center flex-center">
                <div className="full-size border border-info flex-center">
                  <span>{props.rates.diamond}x</span>
                </div>
              </div>
              <div className="col-sm-2 text-center flex-center">
                <div className="full-size border border-success flex-center">
                  <span>{compressNumber(props.rates.diamond * currentValues.diamond)} GB</span>
                </div>
              </div>
            </div>
            <hr />
            <div className="row justify-content-center">
              <div className="col-sm-4 text-center flex-center">
                <p>-></p>
              </div>
              <div className="col-sm-4 text-center">
                <p>-></p>
              </div>
              <div className="col-sm-2 text-center flex-center">
                <p>-></p>
              </div>
              <div className="col-sm-2 text-center flex-center">
                <div className="full-size border border-success flex-center">
                  <span>{compressNumber(totalPay)} GB</span>
                </div>
              </div>
            </div>
            <input className="hidden" name="_csrf" value={props.csrf} />
            <hr />
            <div className="row justify-content-center">
              <div className="col-sm-8 text-center flex-center">
              </div>
              <div className="col-sm-4 text-center flex-center">
                <input type="submit" className="btn btn-lg btn-success" value="Sell Resources" />
              </div>
            </div>
          </form>
          <p className="lead font-italic">*RCCTR: Robo Corp&reg; Current Trade Rate</p>
      </div>
    </div>
  );
};

//Construct a window to allow the player to purchase upgrades
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

//Construct a window to allow the player to view the game's highscores
const HighscoreWindow = (props) => {
  
  const scores = props.scores.map((score, index) => {
    
    //Change the color if the listed user is this user
    let color = "primary";
    if(score.username === username){
      color = "info";
    }
    
    //Build a list item for each individual score
    return (
      <li className={`list-group-item d-flex border border-${color}`}>
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-3 flex-center">
              <span className={`badge badge-${color} badge-pill`}>#{index + 1}</span> 
              <span className="lead space-left"> User: {score.username}</span>
            </div>
            <div className="col-lg-6">
              <p className="lead text-center">Resources</p>
              <div className="flex-center">
                <ul>
                  <li className="flex-center"><img width="25" height="25" src={gbIcon.src} alt="" /> GB: {score.bank.gb}</li>
                  <li className="flex-center"><img width="25" height="25" src={ironIcon.src} alt="" /> Iron: {score.bank.iron}</li>
                  <li className="flex-center"><img width="25" height="25" src={copperIcon.src} alt="" /> Copper: {score.bank.copper}</li>
                  <li className="flex-center"><img width="25" height="25" src={sapphireIcon.src} alt="" /> Sapphires: {score.bank.sapphire}</li>
                </ul>
                <ul>
                  <li className="flex-center"><img width="25" height="25" src={emeraldIcon.src} alt="" /> Emeralds: {score.bank.emerald}</li>
                  <li className="flex-center"><img width="25" height="25" src={rubyIcon.src} alt="" /> Rubies: {score.bank.ruby}</li>
                  <li className="flex-center"><img width="25" height="25" src={diamondIcon.src} alt="" /> Diamonds: {score.bank.diamond}</li>
                </ul>
              </div>
            </div>
            <div className="col-lg-3 flex-center">
              <p className="lead">Score: {score.score}</p>
            </div>
          </div>
        </div>
      </li>
    );
  });
  
  let scoreLists = [];
  let paginationTabs = [];
  
  //Break up the number of returned scores into chunks of 10
  for(let i = 0; i < scores.length; i += 10){
    
    const numScoresLeft = scores.length - i;
    let scoreSet;
    
    if(numScoresLeft <= 10){
      scoreSet = scores.slice(i);
    } else {
      scoreSet = scores.slice(i, i + 10);
    }
    
    //If it's the first set, make it visible. Otherwise, hide the set
    if(i == 0){
      scoreLists.push(
        <ul id={`scoreSet${scoreLists.length}`} className="list-group">
          {scoreSet}
        </ul>
      );
      paginationTabs.push(
        <li id={`scoreLink${paginationTabs.length}`} className="page-item active">
          <button className="page-link" data-set={paginationTabs.length} onClick={changeScoreSet}>{paginationTabs.length + 1}</button>
        </li>
      );
    } else {
      scoreLists.push(
        <ul id={`scoreSet${scoreLists.length}`} className="list-group hidden">
          {scoreSet}
        </ul>
      );
      paginationTabs.push(
        <li id={`scoreLink${paginationTabs.length}`} className="page-item">
          <button className="page-link" data-set={paginationTabs.length} onClick={changeScoreSet}>{paginationTabs.length + 1}</button>
        </li>
      );
    }
  }
  
  //Bundle all of the lists together and display them
  return (
    <div className="container">
      <div className="jumbotron">
        <h1 className="display-3">Top Miners:</h1>
        <p className="lead">Only the best of the best could ever hope to be on this page!</p>
        <hr className="my-4" />
        <div id="highscoreList">
          {scoreLists}
        </div>
        <div className="flex-center">
          <ul id="scorePagination" className="pagination pagination-lg moveDown">
            <li className="page-item">
              <button className="page-link" data-set="0" onClick={changeScoreSet}>&laquo;</button>
            </li>
            {paginationTabs}
            <li className="page-item">
              <button className="page-link" data-set={paginationTabs.length - 1} onClick={changeScoreSet}>&raquo;</button>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

//Helper function to change the set of actively visible highscores
const changeScoreSet = (e) => {
  //Turn off active link / hide the active score set
  const scorePagination = document.querySelector("#scorePagination");
  const activeLink = scorePagination.querySelector(".active");
  const activeLinkId = activeLink.getAttribute("id");
  const activeScoreSet = document.querySelector(`#scoreSet${activeLinkId.charAt(activeLinkId.length - 1)}`);
  activeLink.classList.remove("active");
  activeScoreSet.classList.add("hidden");
  
  //Active the necessary tab
  const dataSet = e.target.getAttribute("data-set");
  document.querySelector(`#scoreLink${dataSet}`).classList.add("active");
  document.querySelector(`#scoreSet${dataSet}`).classList.remove("hidden");
};

//Handle a request to change a password
const handlePasswordChange = (e) => {
	e.preventDefault();
	
  //Password fields cannot be empty
	if($("#newPassword").val() == '' || $("#newPassword2").val() == '' || $("#password").val() == ''){
		handleError("All fields are required to change password.");
		return false;
	}
  
  //New password and password confirmation should match
  if($("#newPassword").val() !==  $("#newPassword2").val()){
    handleError("New password and password confirmation must match");
    return false;
  }

  //Send the data to the server via Ajax
  sendAjax('POST', $("#passwordChangeForm").attr("action"), $("#passwordChangeForm").serialize(), () => {
    handleSuccess("Password successfully changed!");
    $("#newPassword").val("");
    $("#newPassword2").val("");
    $("#password").val("");
  });
	
	return false;
};

//Construct a window to allow the player to view their profile
const ProfileWindow = (props) => {
  return (
    <div className="container">
      <div className="jumbotron">
        <h1 className="display-3">Personal Profile:</h1>
        <p className="lead">Miner ID: {username}</p>
        <hr className="my-4" />
        <h2>Bank Details</h2>
        <ul>
          <li><img width="25" height="25" src={gbIcon.src} alt="" /> GB: {account.bank.gb}</li>
          <li><img width="25" height="25" src={ironIcon.src} alt="" /> Iron: {account.bank.iron}</li>
          <li><img width="25" height="25" src={copperIcon.src} alt="" /> Copper: {account.bank.copper}</li>
          <li><img width="25" height="25" src={sapphireIcon.src} alt="" /> Sapphires: {account.bank.sapphire}</li>
          <li><img width="25" height="25" src={emeraldIcon.src} alt="" /> Emeralds: {account.bank.emerald}</li>
          <li><img width="25" height="25" src={rubyIcon.src} alt="" /> Rubies: {account.bank.ruby}</li>
          <li><img width="25" height="25" src={diamondIcon.src} alt="" /> Diamonds: {account.bank.diamond}</li>
        </ul>
        <hr />
        <form
        id="passwordChangeForm" name="passwordChangeForm"
        action="/updatePassword"
        onSubmit={handlePasswordChange}
        method="POST"
        >
          <fieldset>
            <div className="form-group text-centered row">
              <label htmlFor="newPassword" className="col-sm-3 col-form-label">New Password:</label>
              <div className="col-sm-3">
                <input id="newPassword" name="newPassword" type="password" className="form-control" placeholder="New Password" />
              </div>
              <div className="col-sm-6"></div>
            </div>
            <div className="form-group text-centered row">
              <label htmlFor="newPassword2" className="col-sm-3 col-form-label">Confirm New Password:</label>
              <div className="col-sm-3">
                <input id="newPassword2" name="newPassword2" type="password" className="form-control" placeholder="Confirm" />
              </div>
              <div className="col-sm-6"></div>
            </div>
            <div className="form-group text-centered row">
              <label htmlFor="password" className="col-sm-3 col-form-label">Current Password:</label>
              <div className="col-sm-3">
                <input id="password" name="password" type="password" className="form-control" placeholder="Current Password" />
              </div>
              <div className="col-sm-6"></div>
            </div>
            <input type="hidden" name="_csrf" value={props.csrf} />
            <div className="form-group text-centered row">
              <div className="col-sm-5">
                <input type="submit" id="passwordChangeSubmit" value="Change Password" className="btn btn-lg btn-warning formSubmit" />
              </div>
              <div className="col-sm-3"></div>
              <div className="col-sm-4"></div>
            </div>
          </fieldset>
        </form>
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
      socket.emit('getMyBankData');
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
                        <label className="form-input-label">
                          <img src={gbIcon.src} width="25" height="25" alt="" /> Galaxy Bucks: </label>
                      </div>
                      <div className="col-sm-8">
                        <input name="gb" className="form-control" type="number" min="0" max="1000000" />
                      </div>
                    </div>
                    <hr />
                    <div className="row justify-content-center">
                      <div className="col-sm-4 text-center">
                        <label className="form-input-label">
                          <img src={ironIcon.src} width="25" height="25" alt="" /> Iron: </label>
                      </div>
                      <div className="col-sm-8">
                        <input name="iron" className="form-control" type="number" min="0" max="1000000" />
                      </div>
                    </div>
                    <hr />
                    <div className="row justify-content-center">
                      <div className="col-sm-4 text-center">
                        <label className="form-input-label">
                          <img src={copperIcon.src} width="25" height="25" alt="" /> Copper: </label>
                      </div>
                      <div className="col-sm-8">
                        <input name="copper" className="form-control" type="number" min="0" max="1000000" />
                      </div>
                    </div>
                    <hr />
                    <div className="row justify-content-center">
                      <div className="col-sm-4 text-center">
                        <label className="form-input-label">
                          <img src={sapphireIcon.src} width="25" height="25" alt="" /> Sapphires: </label>
                      </div>
                      <div className="col-sm-8">
                        <input name="sapphire" className="form-control" type="number" min="0" max="1000000" />
                      </div>
                    </div>
                    <hr />
                    <div className="row justify-content-center">
                      <div className="col-sm-4 text-center">
                        <label className="form-input-label">
                          <img src={emeraldIcon.src} width="25" height="25" alt="" /> Emeralds: </label>
                      </div>
                      <div className="col-sm-8">
                        <input name="emerald" className="form-control" type="number" min="0" max="1000000" />
                      </div>
                    </div>
                    <hr />
                    <div className="row justify-content-center">
                      <div className="col-sm-4 text-center">
                        <label className="form-input-label">
                          <img src={rubyIcon.src} width="25" height="25" alt="" /> Rubies: </label>
                      </div>
                      <div className="col-sm-8">
                        <input name="ruby" className="form-control" type="number" min="0" max="1000000" />
                      </div>
                    </div>
                    <hr />
                    <div className="row justify-content-center">
                      <div className="col-sm-4 text-center">
                        <label className="form-input-label">
                          <img src={diamondIcon.src} width="25" height="25" alt="" /> Diamonds: </label>
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
        <div className="progress bg-light">
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
  
  //Hook up viewport (display canvas to JS code)
  canvas = document.querySelector("#viewport");
  ctx = canvas.getContext('2d');
  
  //Add event listeners
  canvas.addEventListener('click', processClick);
  canvas.addEventListener('mousedown', disableExtraActions);
  canvas.addEventListener('mousemove', processMouseMove);
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

//Render the market view (players sell resources)
const renderMarket = () => {
  getTokenWithCallback((csrfToken) => {
    sendAjax('GET', '/getRCCTR', null, (result) => {
      ReactDOM.render(
        <MarketWindow csrf={csrfToken} rates={result.rates} />,
        document.querySelector("#main")
      );
      
      const marketFormInputs = document.querySelectorAll("#marketForm input[type=number]");
      for(let i = 0; i < marketFormInputs.length; i++){
        const input = marketFormInputs[i];
        input.oninput = renderMarket;
      }
    });
  });
};

//Render the upgrade view (players purchase mining upgrades
const renderUpgrades = () => {
  ReactDOM.render(
    <UpgradesWindow />,
    document.querySelector("#main")
  );
};

//Render the highscores view (players compare scores)
const renderHighscores = () => {
  //Initially create a blank panel
  ReactDOM.render(
    <HighscoreWindow scores={[]} />,
    document.querySelector("#main")
  );
  
  //Request highscore data and then display the scores
  sendAjax('GET', '/getHighscores', null, (result) => {
    ReactDOM.render(
      <HighscoreWindow scores={result.scores}/>,
      document.querySelector("#main")
    );
  });
};

//Render the player's profile
const renderProfile = () => {
  getTokenWithCallback((csrfToken) => {
    ReactDOM.render(
      <ProfileWindow csrf={csrfToken} />,
      document.querySelector("#main")
    );
  });
};

//Request a newe csrf token and then execute a callback when one is retrieved
const getTokenWithCallback = (callback) => {
	sendAjax('GET', '/getToken', null, (result) => {
		if(callback){
      callback(result.csrfToken);
    }
	});
};
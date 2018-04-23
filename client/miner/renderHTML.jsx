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
      </div>
    </div>
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
                  <button className="btn btn-lg btn-primary normalWhitespace">Purchase Asteroid ({contract.price}GB)</button>
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
}

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

//Construct a window for buying galaxy bucks (the best currency in the universe!
const PayToWinWindow = (props) => {
  return (
    <div className="container">
      <div className="row justify-content-center">
        <h1>Galaxy Bucks - Only the Best Currency in the Universe!</h1>
      </div>
      <div className="row justify-content-center moveDown">
        <div className="col-lg-3">
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
        <div className="col-lg-3">
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
              <button className="btn btn-lg btn-primary">Purchase</button>
            </div>
          </div>
        </div>
        <div className="col-lg-3">
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
              <button className="btn btn-lg btn-primary">Purchase</button>
            </div>
          </div>
        </div>
        <div className="col-lg-3">
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
              <button className="btn btn-lg btn-primary">Purchase</button>
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
            <button id="payoutButton" className="btn btn-lg btn-primary" data-dismiss="modal" onClick={hideModal}>Collect 50 GBs</button>
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
const hideModal = () => {
  const modal = document.querySelector("#adContainer div");
  
  if(!modal){
    return;
  }
  
  if(adAudio){
    adAudio.pause();
    adAudio.currenTime = 0;
  }
  
  showingAd = false;
  modal.classList.add("hide-anim");
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
  console.log(data);
  ReactDOM.render(
    <BasicContracts contracts={data.basicContracts} />,
    document.querySelector("#basicContracts")
  );
};

//Add more handlers and components if necessary
const renderContracts = () => {
  ReactDOM.render(
    <ContractWindow />,
    document.querySelector("#main")
  );
  
  sendAjax('GET', '/getContracts', null, (result) => {
		populateContractsWindow(result);
	});
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
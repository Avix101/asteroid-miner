//Construct the main game window
const GameWindow = (props) => {
  return (
    <canvas id="viewport" width={props.width} height={props.height}></canvas>
  );
};

const ContractWindow = (props) => {
  return (
    <div className="container">
      <div className="jumbotron">
        <h1 className="display-3">Contract Selection:</h1>
        <p className="lead">Choose wisely.</p>
        <hr className="my-4" />
      </div>
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

//Render the asteroid's progress panel
const renderProgressPanel = (current, total) => {
  ReactDOM.render(
    <ProgressPanel current={current} total={total} />,
    document.querySelector("#rightPanel")
  );
};

//Add more handlers and components if necessary
const renderContracts = () => {
  ReactDOM.render(
    <ContractWindow />,
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
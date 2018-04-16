// check if click between two objects, aka collision
const checkIfClicked = (mouse, obj) => {
  if (mouse.x < obj.x + obj.width &&
       mouse.x > obj.x &&
      mouse.y < obj.y + obj.height &&
      mouse.y > obj.y) {
    return true;
  }

  return false;
};

module.exports = {
  checkIfClicked,
};

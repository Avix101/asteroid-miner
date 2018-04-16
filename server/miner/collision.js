// check if click between two objects, aka collision
const checkIfClicked = (mouse, obj) => {
  console.log(mouse);
  console.log(obj);
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

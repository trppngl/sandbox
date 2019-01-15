var textPane = document.getElementById('text-pane');

// Event handlers

function handleClick(e) {
  
  var clientX = e.clientX;
  var clientY = e.clientY;
  var pageX = e.pageX;
  var pageY = e.pageY;
  
  console.log(clientX, clientY);
  console.log(pageX, pageY);
  console.log(e.target);
}

// Event listeners

textPane.addEventListener('click', handleClick, false);

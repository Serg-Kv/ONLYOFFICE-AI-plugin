var highlightedIndex = -1;

// 当用户输入时监听输入框
document.querySelector(".message-input").addEventListener("input", function() {

    // 获取输入框的值
    var inputValue = this.value;

    // 如果输入框的值以 "/" 开头，则显示下拉菜单
    if (inputValue.startsWith("/")) {
      document.getElementById("command-dropdown").style.display = "block";
    } else {
      document.getElementById("command-dropdown").style.display = "none";
      highlightedIndex = -1; // Reset the highlighted index
    }

    // 清空下拉菜单并重新填充
    var commandDropdown = document.getElementById("command-dropdown");
    commandDropdown.innerHTML = '';
    var options = ["help", "about", "contact", "settings"];

    for (var i = 0; i < options.length; i++) {
      var option = document.createElement("li");
      option.textContent = options[i];
      commandDropdown.appendChild(option);
    }
  
    // 当用户点击下拉菜单中的选项时，将选项的值设置到输入框
    commandDropdown.addEventListener("click", function(event) {
      var selectedOption = event.target;
      document.querySelector(".message-input").value = selectedOption.textContent;
      document.getElementById("command-dropdown").style.display = "none";
      highlightedIndex = -1; // Reset the highlighted index
    });
});

// Listen for keydown events
document.querySelector(".message-input").addEventListener("keydown", function(event) {
  var commandDropdown = document.getElementById("command-dropdown");
  var options = commandDropdown.children;
  
  // If down arrow key is pressed
  if (event.keyCode == 40) {
    event.preventDefault(); // Prevent the default action
    if (highlightedIndex < options.length - 1) {
      if (highlightedIndex != -1) {
        options[highlightedIndex].classList.remove('highlighted');
      }
      highlightedIndex++;
      options[highlightedIndex].classList.add('highlighted');
    }
  }

  // If up arrow key is pressed
  if (event.keyCode == 38) {
    event.preventDefault(); // Prevent the default action
    if (highlightedIndex > 0) {
      options[highlightedIndex].classList.remove('highlighted');
      highlightedIndex--;
      options[highlightedIndex].classList.add('highlighted');
    }
  }

  // If enter key is pressed
  if (event.keyCode == 13 && highlightedIndex != -1) {
    event.preventDefault(); // Prevent the default action
    document.querySelector(".message-input").value = options[highlightedIndex].textContent;
    commandDropdown.style.display = "none";
    highlightedIndex = -1; // Reset the highlighted index
  }
});

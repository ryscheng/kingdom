
function init() {

  console.log("Initializing...")
  annyang.addCommands({
    "hello": function() {
      alert('Hello world!'); 
    }
  });
  // Tell KITT to use annyang
  SpeechKITT.annyang();
  // Define a stylesheet for KITT to use
  SpeechKITT.setStylesheet("./build/flat.css");
  // Render KITT's interface
  SpeechKITT.vroom();
}

if (annyang) {
  init()
} else {
  console.log("Missing annyang");
}

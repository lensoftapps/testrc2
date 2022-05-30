

document.getElementById("button-wc-to-na").addEventListener("click", sendDataFromWcToNa);

function sendDataFromWcToNa(){
    const data = {
        field1: 'This is stats',
        field2: 'This is annotation',
      };
      console.log("[WC] Sending data from WC to NA:");
      console.log(data);
      //window.electron.messageWcToNa(data);
}

document.addEventListener('onMessageNaToWc', function (e:CustomEvent) {
    console.log('[WC] Got Message NA to WC:');
    console.log(e.detail) 
}, false);


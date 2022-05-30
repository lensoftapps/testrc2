import { protocol, ProtocolResponse } from "electron";
import * as fs from "fs";

export const test_protocol_registerPrivileged = () => {
    protocol.registerSchemesAsPrivileged([
        {
          scheme: 'book', privileges: {
            standard: true,
            supportFetchAPI: true,
            corsEnabled: true,
            bypassCSP: true,
            secure: true
          }
        }
      ]);
}

export const test_protocol_registerBuffer = () => {
    protocol.registerBufferProtocol('book', (request, callback) => {
      //console.log("registerBufferProtocol");
      //console.log(request);
      const path = "C:/ProgramData/ReadCloud/Books/5e857c9643154f4816dad7b4.pdf";
      //"/home/pete/Downloads/sample2.pdf";
      const fd = fs.openSync(path, 'r');
      const info = fs.statSync(path);    
        
  
      let [start, end] = request.headers.Range.replace(/bytes=/, "").split("-");
      let startBytes = parseInt(start, 10);
      let endBytes = end ? parseInt(end, 10) : info.size - 1;
  
      const data = Buffer.alloc(endBytes - startBytes);
  
      fs.readSync(fd, data, 0, data.length, startBytes);
  
      const r: ProtocolResponse = { data };

      if(startBytes === 0)
        console.log(r);

      callback(r);
  
    });
}
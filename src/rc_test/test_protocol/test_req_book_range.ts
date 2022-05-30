/*const insertHtml = () => {
    const element1 = document.getElementsByTagName("head");
    if (element1) {
      element1[0].innerHTML += 
      "<script src=\"http://mozilla.github.io/pdf.js/build/pdf.js\"></script>";
    };   
  }*/

const requestBookRange = () => {
    const wnd: any = window as any; //console.log(wnd);
    const pdfjsLib: any = wnd.pdfjsLib; //console.log(pdfjsLib);

    var url = 'book://sample.pdf';    
    var getRange = (url: string, start: number, end: number) => {
        return fetch(url, {
        headers: {
            "Range" : `bytes=${start}-${end}`
        }
        });
    };
    
    
    let transport = new pdfjsLib.PDFDataRangeTransport(105255200, []);
    transport.requestDataRange = function (begin: number, end: number) {
        getRange("book://sample.pdf", begin, end).then((data) => {        
        data.arrayBuffer().then(x => {
            transport.onDataProgress(end);
            transport.onDataRange(begin, x);
        })        
        });
    };
    
    var loadingTask = pdfjsLib.getDocument(transport);

    loadingTask.promise.then(function (pdf: any) {
        console.log('PDF loaded');

        // Loaded via <script> tag, create shortcut to access PDF.js exports.
        var pdfjsLib = wnd['pdfjs-dist/build/pdf'];

        // The workerSrc property shall be specified.
        pdfjsLib.GlobalWorkerOptions.workerSrc = 'http://mozilla.github.io/pdf.js/build/pdf.worker.js';

        // Asynchronous download of PDF

        // Fetch the first page
        var pageNumber = 1;
        pdf.getPage(pageNumber).then(function (page: any) {
        console.log('Page loaded');

        var scale = 1.5;
        var viewport = page.getViewport({ scale: scale });

        // Prepare canvas using PDF page dimensions
        var canvas: any = document.getElementById('the-canvas');
        var context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        // Render PDF page into canvas context
        var renderContext = {
            canvasContext: context,
            viewport: viewport
        };
        var renderTask = page.render(renderContext);
        renderTask.promise.then(function () {
            console.log('Page rendered');
        });
        });
    }, function (reason: any) {
        // PDF loading error
        console.error(reason);
    });
}  

export const test_req_book_range = () => {

    //insertHtml();
    requestBookRange();

    //setTimeout(function(){ console.log("Requesting book range"); requestBookRange(); }, 5000);
    
    
}
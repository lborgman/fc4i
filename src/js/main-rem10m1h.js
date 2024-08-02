// https://flaviocopes.com/service-workers/
/*         
const worker = new Worker('src/js/worker.js');
worker.onerror = (workerErr) => {
    const errMsg = workerErr.message;
    console.error({ workerErr });
    console.error({ errMsg });
}
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js')
            .then((registration) => {
                console.log('Service Worker registration completed with scope: ',
                    registration.scope)
            }, (err) => {
                console.log('Service Worker registration failed', err)
            })
    })
} else {
    console.log('Service Workers not supported')
}
*/



const main = async () => {
}
main();
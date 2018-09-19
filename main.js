/* ===== Main JS =============
|  to test blockchain    |
|  ===========================*/

const Blockchain = require('./BlockChain');
var chain = new Blockchain();

const Block =  require('./Block');

(function theLoop (i) {
    setTimeout(function () {
        var testBlk = new Block("Test Block - " + (i + 1));
        chain.addBlock(testBlk).then((res)=>{
            i++;
            if (i < 5) theLoop(i);
            else chain.validateChain();
        }).catch((err)=>{
        	console.log('Could not add block '+(i+1),err);
        });
    }, 1000);
})(0);

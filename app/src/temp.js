GoodCoinMarket.deployed().then(
    function (instance) {
       
       
       instance.buy(
            {
                'from': '0x9b36dEa68d42668Bed85c91b990BD306a18310C6',
                'value': 1000000000000000000
            },

            function (err, isTxSuccess) {
                if (err) {
                    return console.error(err);;
                } else {
                    console.log("Transaction to" + ehteriumAccounts[0] + " succeeded?" + isTxSuccess);
                }
            }
        )



    });



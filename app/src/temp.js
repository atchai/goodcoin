GoodCoinMarket.deployed().then(
    function (instance) {


        instance.buy(
            {
                'from': '0x9b36dEa68d42668Bed85c91b990BD306a18310C6',
                'value': 1000000000000000000
            }
        )



    });


GoodCoinMarket.deployed().then(
    function (instance) {
        let price = instance.calculatePriceForSale(10000,
            {
                'from': '0x9b36dEa68d42668Bed85c91b990BD306a18310C6'
            }).then(function(price){console.log(price)});
        

    });





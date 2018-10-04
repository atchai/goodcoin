class EventSubscriber {



    constructor(web3js, goodCoinMarket, goodCoin) {
        this.web3js = web3js;
        this.goodCoinMarket = goodCoinMarket;
        this.goodCoin = goodCoin;
        this.subscribe = this.initialize();
    }

    initialize() {
        // a list for saving subscribed event instances
        const subscribedEvents = {}
        // Subscriber method
        const subscribeLogEvent = (contract, eventName) => {
            const eventJsonInterface = this.web3js.utils._.find(
                contract._jsonInterface,
                o => o.name === eventName && o.type === 'event',
            )
            const subscription = this.web3js.eth.subscribe('logs', {
                address: contract.options.address,
                topics: [eventJsonInterface.signature]
            }, (error, result) => {
                
                if (!error) {
                    const eventObj = this.web3js.eth.abi.decodeLog(
                        eventJsonInterface.inputs,
                        result.data,
                        result.topics.slice(1)
                    )
                    console.log(`New ${eventName}!`, eventObj)
                }else{
                    console.error(`Error in ${eventName}:`, error)
                }
            })
            subscribedEvents[eventName] = subscription
        }
        
        return subscribeLogEvent;

    }

}

module.exports = EventSubscriber;

import Logger from './Logger'

class EventSubscriber {

    constructor(web3js, goodCoinMarket, goodCoin) {
        this.web3js = web3js;
        this.goodCoinMarket = goodCoinMarket;
        this.goodCoin = goodCoin;
        this.subscribedEvents = {}; // a list for saving subscribed event instances
    }


    subscribeLogEvent(contract, eventName) {
        let logger = new Logger();

        

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

                logger.logEvent(eventName, eventObj);

            } else {
                console.error(`Error in ${eventName}:`, error)
            }
        })
        this.subscribedEvents[eventName] = subscription
    }





}

module.exports = EventSubscriber;

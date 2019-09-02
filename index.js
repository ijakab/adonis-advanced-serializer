'use strict'
const { ServiceProvider } = use('@adonisjs/fold')

class ElasticLucidProvider extends ServiceProvider {
    register () {
        this.app.bind('VanillaSerializer', () => {
            return require('@adonisjs/lucid/src/Lucid/Serializers/Vanilla')
        })
        this.app.bind('AdvancedSerializer', () => {
            return require('./src/BaseSerializer')
        })
        this.app.bind('SerializerExtender', () => {
            return require('./src/Trait')
        })
    }

    boot () {
    
    }
}

module.exports = ElasticLucidProvider

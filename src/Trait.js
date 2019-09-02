'use strict'

class SerializerExtender {
    register (Model) {
        Model.prototype.serializer = function () {
            const Serializer =  Model.resolveSerializer()
            return new Serializer(this, null, true)
        }
        
        Model.prototype.toJSON = function (...args) {
            return this.serializer().toJSON(...args)
        }
    
        Model.prototype.toCustomJSON = function (...args) {
            return this.serializer().toCustomJSON(...args)
        }
    }
}
2
module.exports = SerializerExtender

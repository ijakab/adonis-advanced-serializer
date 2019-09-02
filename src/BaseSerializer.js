const VanillaSerializer = use('VanillaSerializer')
const each = require('lodash/each')

class BaseSerializer extends VanillaSerializer{
    _getRowJSON (modelInstance, args) {
        if(!this._mode) {
            if(this.serializeSingle) {
                var json = this.serializeSingle(modelInstance, ...args)
            } else {
                var json = modelInstance.toObject()
            }
        }
        else {
            const methodName = `serializeSingle${this._mode}`
            if(!this[methodName]) throw {status: 500, message: `${methodName} does not exist on serializer ${this.constructor.name}`}
            var json = this[methodName](modelInstance, ...args)
        }
        
        this._attachRelations(modelInstance, json)
        this._attachMeta(modelInstance, json)
        return json
    }
    
    toJSON(...args) {
        if (this.isOne) {
            return this._getRowJSON(this.rows, args)
        }
    
        let data = this.rows.map(row => this._getRowJSON(row, args))
        if(this[`serializeCollection${this._mode}`]) data = this[`serializeCollection${this._mode}`](data, ...args)
        else if(this.serializeCollection) data = this.serializeCollection(data, ...args)
        
        if (this.pages) {
            return {pagination: this.pages, data}
        }
        return data
    }
    
    toCustomJSON(mode, ...args) {
        this.serializeWith(mode)
        return this.toJSON(...args)
    }
    
    forwardMode(mode) {
        this._forwardMode = mode
        return this
    }
    
    serializeWith(mode) {
        this._mode = mode
        return this
    }
    
    _attachRelations (modelInstance, output) {
        each(modelInstance.$relations, (relatedObject, relationName) => {
            let methodName = `${relationName}Include`
            if(this[methodName]) {
                return this[methodName](modelInstance, output)
            }
            output[relationName] = relatedObject.serializer().serializeWith(this._forwardMode || this._mode).toJSON()
        })
    }
    
    serializer() {
        return this
    }
}

module.exports = BaseSerializer

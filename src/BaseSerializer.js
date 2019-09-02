const VanillaSerializer = use('VanillaSerializer')
const each = require('lodash/each')

class BaseSerializer extends VanillaSerializer{
    _getRowJSON (modelInstance, args) {
        let methodName = `serializeSingle${this._mode}`
        if(!this[methodName]) methodName = `serializeSingle`
        var json = this[methodName](modelInstance, ...args)
        
        this._attachRelations(modelInstance, json, args)
        this._attachMeta(modelInstance, json)
        return json
    }
    
    serializeSingle(modelInstance) {
        return modelInstance.toJSON()
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
    
    _attachRelations (modelInstance, output, args) {
        each(modelInstance.$relations, (relatedObject, relationName) => {
            let methodName = `${relationName}Include`
            if(this[methodName]) {
                return this[methodName](modelInstance, output, ...args)
            }
            output[relationName] = relatedObject.serializer().serializeWith(this._forwardMode || this._mode).toJSON()
        })
    }
    
    serializer() {
        return this
    }
}

module.exports = BaseSerializer

# Adonis advanced serializers

Service provider for [adonis framework](https://adonisjs.com/). Greatly extends functionality of vanilla serializer and serves as alternative to [bumblebee transformers](git@github.com:rhwilr/adonis-bumblebee.git)

## Installation

1. run `npm i --save adonis-advanced-serializer`
2. register provider inside `start/app.js`

```javascript
const providers = [
    ///whatever you have
    'adonis-advanced-serializer'
]
```

3. Add helper trait to any models you want to use this serializer. (Recommended to do this in all models).  Register serializer on those models. It can be AdvancedSerializer (provided by this provider) or your custom serializer that extends AdvancedSerializer

*inside model file*:
```javascript
const Model = use('Model')

class MyModel extends Model{
    static boot() {
        this.addTrait('@provider:SerializerExtender')
    }
    
      static get Serializer() {
          return 'App/Models/Serializers/MyModelSerializer'
      }
}

module.exports = MyModel
```

*inside serializer file*
```javascript
const AdvancedSerializer = use('AdvancedSerializer')

class MyModelSerializer extends AdvancedSerializer{
  /* READ FURTHER DOCUMENTATION */
}
```

## Advantages of advanced serializers

Vanilla serializer provided by lucid is great, but lacking some useful features. You cannot pass arguments to toJSON, apply different methods in based on different conditions etc. Adonis gives you a way to use different serializer (which is what this provider takes advantage of), but you would have to rewrite entire logic.

To solve much of these problems, you could use [bumblebee transformers](git@github.com:rhwilr/adonis-bumblebee.git). However, this alternative has (in our opinion) has some key advantages:

1. Call it directly from the model instances. No need to import and create transformers

1. Independent of execution context. While bumblebee is also technically independent, context is the only way through which you can pass arguments, and calling it not from context is a pain.

1. Does not automatically load records that are not eager loaded. That can be very dangerous

1. Completely removes need to set includes. Keeping include string is a lot of additional complexity, can get very hard to maintain, and do not work as one would expect. This will automatically include anything that is eager loaded.

1. No need to specify almost anything if you want default behaviour - override only custom functionality. Include method where you just return serialized collection does not need to be written

1. Override the way collection is returned on specific serializer

1. Set different serialize modes and custom handle them

## Calling serializers

Like native serializers, call them after first() or fetch() with .toJSON(). With this provider, you can pass argument to toJSON().

toJSON will serialize with default mode. This provider introduces .toCustomJSON() 

```javascript
let instance = await Model.find(2)
instance.toCustomJSON('Full', user.id) //Full is mode name. other arguments are can be whatever
instance.toJSON(user.id) //No mode name, serializes on default mode. arguments can be whatever
```

## Getters, setters, computed and dates

It is not documented well, but adonis these are actually bound to lucid instances, not serializers. Inside your serializer, you can call `modelInstance.toObject()` to get those.

## Serializer classes

Methods you can override on classes are:

| signature | return | description |
| --------- | ------ | ----------- |
| serializeSingle(modelInstance, ...args) | return json from model | override default way that model is transformed into json. Passes any arguments you passed to toJSON |
| serializeCollection(json, ...args) | return json of model collections | override default way collection of models is formed. First argument collection of values returned by serializeSingle. Passes any arguments you passed to toJSON |
| serializeSingle${mode} or serializeSingle${mode} | *like above* | Act like above methods, except they will be called instead of default if serializing with specified mode |
| ${relation}Include(modelInstance, output) | void (modify output object instead of returning | Override default way relation is included by modifying output object. |

So, example serializer class would look like: 

```javascript
const AdvancedSerializer = use('AdvancedSerializer')
const keyBy = require('lodash/keyBy')

class HomeSerializer extends AdvancedSerializer{
  serializeSingle(modelInstance, userId) {
      let response = {
          id: modelInstance.id,
          isMine: userId === modelInstance.user_id
      }
      return response
  }
  
  serializeCollection(data) {
      return keyBy(data, 'type')
  }
  
  serializeCollectionRaw(data) {
      return data //don't key by on this mode
  }
  
  salesRecordsInclude(home, output, userId) {
      if(home.user_id === userId) output.salesRecords = home.getRelated('salesRecords').toJSON()
  }
}

module.exports = HomeSerializer
```

## Serializer instance

For more in-depth configuration, you can access serializer instance from the model, and use some defined functions as a builder

```javascript
let users = await User.all()
users
    .serializer() //comes with provider, get serializer instance
    .serializeWith('Raw') //comes with provider, sets serialize mode
    .somethingMine(data)
    .toJSON(otherData)
```

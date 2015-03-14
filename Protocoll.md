**Table of Contents**


# General #

**I use JSON-RPC**

I use JSON syntax to communicate between server and client. With this you can easily make your own client.

# Required Fields #
**You have to specify these fields in every request/responce**

## Request ##
| **Field** | **Datatype** | **Description** |
|:----------|:-------------|:----------------|
| method | String | Specify the action. For some requests you have to specify more fields. |
| params | Object | Parameter for the request |
| id | Integer | Timestamp on client. I dont use this field yet, but its in JSON-RPC |


```
{"method": "a method", "params": null, "id": 1323688455390}
```

## Responce ##

| **Field** | **Datatype** | **Description** |
|:----------|:-------------|:----------------|
| result | String | the result or null in case of an error |
| error | String | the error object. null if no error occured |
| id | Integer | Timestamp on client. I dont use this field yet, but its in JSON-RPC |

```
{"result": "success", "error": null, "id": 1323688455390}

{"result": null, "error": "couldn't connect to database", "id": 1323688455390}
```

# Check for new messages #

## Request ##
| **Field** | **Datatype** | **Description** |
|:----------|:-------------|:----------------|
| method | String | "checknewmessage" |
| params->lastid | int | **Optional** The id of the last message. To check if a newer one is available. If you leaf it blank it will return instantly the newest messages. |
| params->max\_messages | int | **Optional** Limites the amount of messages returned. Used for the first request, because we dont know the newest id. |

```
{'method': 'checknewmessage', "params": {'lastid': 20, 'max_messages': 7}}
```

## Responce ##
**I list just the additional fields to the required.**
| **Field** | **Datatype** | **Description** |
|:----------|:-------------|:----------------|
| result[.md](.md) | List{Object} | A list with message objects. |
| result[.md](.md)->id | int | Id of the message |
| result[.md](.md)->message | String | The message. |
| result[.md](.md)->timestamp | String | Timestamp in DB format (YYYY-MM-DD HH:MM:SS) |
| result[.md](.md)->name | String | Username of sender|

```
{"result":[
{"id":"1","name":"anonymous","message":"hello world","timestamp":"2011-12-12 09:48:26"},
{"id":"2","name":"anonymous","message":"test1","timestamp":"2011-12-12 10:48:36"}],
"error":null,
"id":"1323688283822"}
```

# Add Message #

## Request ##
**I list just the additional fields to the required.**
| **Field** | **Datatype** | **Description** |
|:----------|:-------------|:----------------|
| method | String | "addmessage" |
| params->message | String | The message. |

## Responce ##
No special fields in responce. Just success or an errror.
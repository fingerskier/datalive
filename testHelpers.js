const randomString = () => Math.random().toString(36).substring(2, 15)
const randomInt = () => Math.floor(Math.random() * 1000000)
const sleep = async (ms) => new Promise(resolve => setTimeout(resolve, ms))

export {randomString, randomInt, sleep}

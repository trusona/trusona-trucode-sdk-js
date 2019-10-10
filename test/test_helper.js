import chai from 'chai'
import dirtyChai from 'dirty-chai'
import sinon from 'sinon'

chai.use(dirtyChai)

global.expect = chai.expect
global.sinon = sinon

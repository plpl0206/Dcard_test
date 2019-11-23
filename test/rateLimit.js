const app = require('../app');
const redisClient = require('../utils/redisClient').getRedisInstance();
const parallel = require('mocha.parallel');
const NanoTimer = require('nanotimer');
const chai = require('chai');
const chaiHttp = require('chai-http');
const { expect } = chai;
chai.use(chaiHttp);

const ips = ['192.168.0.1','192.168.0.2','192.168.0.3'];

function redisFlush(){
    redisClient.flushall((err, succeeded) => {
        if (err)
            console.log('\tredis flush fail err = ' + err);
        else
            console.log('\tredis flush success');
    });
}

describe('Rate limit', function(){

    describe('Single client', function(){
        
        beforeEach(function(){
            redisFlush();
        });

        it('GET / exceed 60 times', function(done){
            this.timeout(60000);
            (async () =>{
                for (let i = 1 ; i <= 60 ; ++i){
                    (async () => {
                        const res = await chai.request(app).get('/').send();
                        expect(res.text).to.equals(i.toString());
                    })();
                }
                const exceedRes = await chai.request(app).get('/').send();
                expect(exceedRes.status).to.equals(429);
                expect(exceedRes.text).to.equals('Error');
                done();
            })();
        });

        it('GET / exceed 60 times and access again after 1 min', function(done){
            this.timeout(120000);
            (async () =>{
                let timer = new NanoTimer();
                const firstRes = await chai.request(app).get('/').send();
                expect(firstRes.text).to.equals('1');
                timer.setTimeout(async function(){
                    const res = await chai.request(app).get('/').send();
                    expect(res.text).to.equals('1');
                    done();
                }, '', '60s');

                for (let i = 2 ; i <= 60 ; ++i){
                    (async () => {
                        const res = await chai.request(app).get('/').send();
                        expect(res.text).to.equals(i.toString());
                    })();    
                }
                const exceedRes = await chai.request(app).get('/').send();
                expect(exceedRes.text).to.equals('Error');
            })();
        });
    });

    describe('Three clients parallel access test 1', function(){

        before(function(){
            redisFlush();
        });

        parallel('GET / exceed 60 times', function() {

            for (let i = 0 ; i < ips.length ; i++) {
                it('client'+i, async function(done){
                    this.timeout(60000);
                    for (let j = 1 ; j <= 60 ; ++j){
                        (async () => {
                            const res = await chai.request(app).get('/').set('X-Forwarded-For', ips[i]).send();
                            expect(res.text).to.equals(j.toString());
                        })();
                    }
                    const exceedRes = await chai.request(app).get('/').set('X-Forwarded-For', ips[i]).send();
                    expect(exceedRes.status).to.equals(429);
                    expect(exceedRes.text).to.equals('Error');
                    done();
                });
            }
        });
    });

    describe('Three clients parallel access test 2', function(){

        before(function(){
            redisFlush();
        });

        parallel('GET / exceed 60 times and access again after 1 min', function() {

            for (let i = 0 ; i < ips.length ; i++) {
                it('client'+i, function(done){
                    this.timeout(180000);
                    (async () => {
                    let timer = new NanoTimer();
                    const firstRes = await chai.request(app).get('/').set('X-Forwarded-For', ips[i]).send();
                    expect(firstRes.text).to.equals('1');
                    timer.setTimeout(async function(){
                        const res = await chai.request(app).get('/').set('X-Forwarded-For', ips[i]).send();
                        expect(res.text).to.equals('1');
                        done();
                    }, '', '60s');
    
                    for (let j = 2 ; j <= 60 ; ++j){
                        (async () => {
                            const res = await chai.request(app).get('/').set('X-Forwarded-For', ips[i]).send();
                            expect(res.text).to.equals(j.toString());
                        })();    
                    }
                    const exceedRes = await chai.request(app).get('/').set('X-Forwarded-For', ips[i]).send();
                    expect(exceedRes.text).to.equals('Error');
                })();
                });
            }
        });

    });

    after(function(){
        redisFlush();
    });

});
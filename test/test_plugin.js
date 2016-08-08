var configRevReplace = require('../index');
var assert = require('stream-assert');
var expect = require('chai').expect;
var sinon = require('sinon');
var gulp = require('gulp');
var path = require('path');
var fs = require('fs');
var File = require('gulp-util').File;

function fixtures(files) {
    return path.join(__dirname, 'fixtures', files);
}

describe('requirejs-rev-replace', function () {

    it('should ignore null files', function (done) {
        var cb = sinon.spy();
        var stream = configRevReplace({
            alias: cb,
            manifest: gulp.src(fixtures('manifest.json'))
        });

        stream
            .pipe(assert.length(1))
            .pipe(assert.end(completed));
        stream.write(new File());
        stream.end();

        function completed() {
            expect(cb.calledOnce).to.eql(false);
            done();
        }
    });

    it('should fail without manifest', function (done) {
        gulp.src(fixtures('config.js'))
            .pipe(configRevReplace())
            .on('error', function (err) {
                expect(err.message).to.eql('Must provide a manifest stream.');
                done();
            });
    });

    it('should emit error on streamed file', function (done) {
        gulp.src(fixtures('config.js'), {buffer: false})
            .pipe(configRevReplace({
                manifest: gulp.src(fixtures('manifest.json'))
            }))
            .on('error', function (err) {
                expect(err.message).to.eql('Streams are not supported.');
                done();
            });
    });

    it('should replace paths', function (done) {
        gulp.src(fixtures('config.js'))
            .pipe(configRevReplace({
                manifest: gulp.src(fixtures('manifest.json'))
            }))
            .pipe(assert.length(1))
            .pipe(assert.first(function (file) {
                var expected = fs.readFileSync(fixtures('config.expected.js'), {encoding: 'utf-8'});
                expect(file.contents.toString()).to.equal(expected);
            }))
            .pipe(assert.end(done));
    });

});

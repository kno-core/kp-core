/*
 * Middleware wrapper for Passportjs
 */
import {MiddlewareInterface} from "../lib/MiddlewareInterface";
import {Core} from "../lib/Core";
import {RouteInterface} from "../lib/RouteInterface";
import {Authenticator} from "../lib/Authenticator";
import {readFileSync} from "fs";

var passport = require('passport');


export class Passport implements MiddlewareInterface {

	setup(app: Core) {

		// used to serialize the user for the session
		passport.serializeUser(function (user, done) {
			done(null, user);
		});

		var GitHubStrategy = require('passport-github').Strategy;

		passport.use(new GitHubStrategy(JSON.parse(readFileSync("./secrets.json",'utf8'))["passport"]["github"],
			function (accessToken, refreshToken, profile, cb) {

				app.IAM().findOrCreate({githubId: profile.id}).then(function (res) {
					console.log('USER', refreshToken, accessToken, profile, cb);
					return cb(false, res);
				});
			}
		));

		app.use('/(.+)?', function (route: RouteInterface) {
			return new Promise(function (resolve, reject) {
				passport.initialize()(route.getRequest(), route.getResponse(), resolve);
			});
		});

		app.use('/(.+)?', function (route: RouteInterface) {
			return new Promise(function (resolve, reject) {
				passport.session()(route.getRequest(), route.getResponse(), resolve);
			});
		});

		app.use('/auth/github/', function (route: RouteInterface) {
			return new Promise(function (resolve, reject) {
				passport.authenticate('github')(route.getRequest(), route.getResponse(), resolve);
			});
		});

		app.use('/callback/auth/github/?(.+)?', function (route: RouteInterface) {
			return new Promise(function (resolve, reject) {
				passport.authenticate('github', {failureRedirect: '/login/'})(route.getRequest(), route.getResponse(), function () {
						/// GOOD AUTH SHOUDL REDIRECT
					route.enqueueScript("window.location = '/profile/';");
					resolve();
				});
			});
		});

	}

}
const chai = require("chai");
const chaiHttp = require("chai-http");

const { app, runServer, closeServer } = require("../server");

// this lets us use *expect* style syntax in our tests
// so we can do things like `expect(1 + 1).to.equal(2);`
// http://chaijs.com/api/bdd/
const expect = chai.expect;

// This let's us make HTTP requests
// in our tests.
// see: https://github.com/chaijs/chai-http
chai.use(chaiHttp);

	describe("Recipes", function(){
		before(function(){
			return runServer();
		});

		after(function(){
			return closeServer();
		});

		//testing the GET functionality
		it('should return a list of recipes on GET', function(){
			return chai.request(app)
				.get('/recipes')
				.then(function(res) {
					expect(res).to.have.status(200);
					expect(res).to.be.json;
					expect(res.body).to.be.a('array');
					expect(res.body.length).to.be.at.least(1);
					const expectedKeys = ["name", "ingredients"];
					res.body.forEach(function(item) {
						expect(item).to.be.a("object");
						expect(item).to.include.keys(expectedKeys);
					});

				});
		});

		//test POST functionality
		it('should create a new item on POST', function(){
			const newItem = {name: 'cake', ingredients: ["3 eggs", "loads of sugar", "flour", "milk"]};
			return chai.request(app)
				.post('/recipes')
				.send(newItem)
				.then(function(res){
					expect(res).to.have.status(201);
					expect(res).to.be.json;
					expect(res.body).to.be.a('object');
					expect(res.body).to.include.keys("id", "name", "ingredients");
					expect(res.body.id).to.not.equal(null);
					expect(res.body).to.deep.equal(
						Object.assign(newItem, {id: res.body.id})
					);
				})
			});

			//test PUT functionality
		it('should update an item on PUT', function(){
			const updateItem = {
				name: 'blueberry cake',
				ingredients: ['eggs', 'blueberries', 'flour', 'milk']
			};

			return (
				chai.request(app)
					.get('/recipes')
					.then(function(res){
						updateItem.id = res.body[0].id;
						return chai
							.request(app)
							.put(`/recipes/${updateItem.id}`)
							.send(updateItem)
					})
					.then(function(res){
						expect(res).to.have.status(204);
						expect(res).to.be.json;
						expect(res.body).to.be.a('object');
						expect(res.body).to.deep.equal(updateItem);
					})
				);
			});

			//test DELETE functionality
			it('should remove items on DELETE', function() {
				return chai
					.request(app)
					.get('/recipes')
					.then(function(res){
						return chai.request(app).delete(`/recipes/${res.body[0].id}`)
						})
					.then(function(res){
						expect(res).to.have.status(204);
					})
			});
		});
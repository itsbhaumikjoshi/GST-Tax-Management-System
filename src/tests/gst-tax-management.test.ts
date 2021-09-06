import chai, { expect } from 'chai';
import chaiHttp from 'chai-http';

chai.use(chaiHttp);
chai.should();

let token = "",
    userId = "",
    taxAccountantId = "",
    taxPayerId = "",
    taxDueId = "";
const PORT = process.env.PORT || 5000;

const URL = `http://localhost:${PORT}`;

console.log(URL);

describe("Server Status", () => {
    it("should get the server health status", (done) => {
        chai.request(URL)
            .get(`/`)
            .end((err, res) => {
                expect(err).to.be.null;
                res.should.have.status(200);
                res.body.should.be.a('object');
                done();
            });
    });
});

describe("GST Tax Management System", () => {
    it("should create a new tax payer with username: taxPayer", (done) => {
        chai.request(URL)
            .post(`/api/users`)
            .send({
                firstName: "test1",
                lastName: "test2",
                username: "taxPayer",
                password: "test"
            })
            .end((err, res) => {
                expect(err).to.be.null;
                res.should.have.status(201);
                res.body.should.be.a('object');
                taxPayerId = res.body._id;
                done();
            });
    });

    it("should create a new tax payer with username: taxAccountant", (done) => {
        chai.request(URL)
            .post(`/api/users`)
            .send({
                firstName: "test1",
                lastName: "test2",
                username: "taxAccountant",
                password: "test"
            })
            .end((err, res) => {
                expect(err).to.be.null;
                res.should.have.status(201);
                res.body.should.be.a('object');
                taxAccountantId = res.body._id;
                done();
            });
    });

    it("should login a user with role admin", (done) => {
        chai.request(URL)
            .post(`/api/login`)
            .send({
                username: "admin",
                password: "test"
            })
            .end((err, res) => {
                expect(err).to.be.null;
                res.should.have.status(200);
                expect(res).to.have.header("token");
                token = res.header["token"]
                userId = res.body._id;
                res.body.should.be.a('object');
                done();
            });
    });

    it("admin should promote the user with username: taxAccountant (tax-payer -> tax-accountant)", (done) => {
        chai.request(URL)
            .get(`/api/users/make-tax-accountant/${taxAccountantId}`)
            .set("authorization", `Bearer ${token}`)
            .end((err, res) => {
                expect(err).to.be.null;
                res.should.have.status(200);
                res.body.should.be.a('object');
                done();
            });
    });

    it("should logout the admin", (done) => {
        chai.request(URL)
            .delete(`/api/logout`)
            .set("authorization", `Bearer ${token}`)
            .end((err, res) => {
                expect(err).to.be.null;
                res.should.have.status(200);
                res.body.should.be.a('object');
                token = "";
                userId = "";
                done();
            });
    });

    it("should login a user with role tax-accountant", (done) => {
        chai.request(URL)
            .post(`/api/login`)
            .send({
                username: "taxAccountant",
                password: "test"
            })
            .end((err, res) => {
                expect(err).to.be.null;
                res.should.have.status(200);
                expect(res).to.have.header("token");
                token = res.header["token"]
                userId = res.body._id;
                res.body.should.be.a('object');
                done();
            });
    });

    it("should get all tax-payers", (done) => {
        chai.request(URL)
            .get("/api/users/tax-payer")
            .set("authorization", `Bearer ${token}`)
            .end((err, res) => {
                expect(err).to.be.null;
                res.should.have.status(200);
                expect(res.body).to.be.an('array');
                done();
            });
    });

    it("should get a particular tax-payer", (done) => {
        chai.request(URL)
            .get(`/api/users/tax-payer/${taxPayerId}`)
            .set("authorization", `Bearer ${token}`)
            .end((err, res) => {
                expect(err).to.be.null;
                res.should.have.status(200);
                res.body.should.be.a('object');
                done();
            });
    });

    it("should update username of (taxPayer -> taxPayer1)", (done) => {
        chai.request(URL)
            .put(`/api/users/tax-payer/${taxPayerId}`)
            .set("authorization", `Bearer ${token}`)
            .send({ username: "taxPayer1" })
            .end((err, res) => {
                expect(err).to.be.null;
                res.should.have.status(200);
                res.body.should.be.a('object');
                done();
            });
    });

    it("tax-accountant (taxAccountant) creating a tax-due for (taxPayer1)", (done) => {
        const date = new Date();
        date.setDate(date.getDate() + 1);
        chai.request(URL)
            .post(`/api/taxs`)
            .set("authorization", `Bearer ${token}`)
            .send({
                state: "Kerala",
                stateTax: 400,
                interestRate: 2,
                panCard: "demo",
                salaryIncome: 600000,
                dueDate: date,
                userId: taxPayerId
            })
            .end((err, res) => {
                expect(err).to.be.null;
                res.should.have.status(201);
                res.body.should.be.a('object');
                taxDueId = res.body._id;
                done();
            });
    });

    it("get all tax-dues", (done) => {
        chai.request(URL)
            .get(`/api/taxs/tax-dues`)
            .set("authorization", `Bearer ${token}`)
            .end((err, res) => {
                expect(err).to.be.null;
                res.should.have.status(200);
                expect(res.body).to.be.an('array');
                done();
            });
    });

    it("get a filtered tax-due, (created at = now)", (done) => {
        chai.request(URL)
            .get(`/api/taxs/tax-dues?key=createdAt&value=${Date.now()}`)
            .set("authorization", `Bearer ${token}`)
            .end((err, res) => {
                expect(err).to.be.null;
                res.should.have.status(200);
                expect(res.body).to.be.an('array');
                done();
            });
    });

    it("get a filtered tax-due, (status NEW)", (done) => {
        chai.request(URL)
            .get(`/api/taxs/tax-dues?key=status&value=NEW`)
            .set("authorization", `Bearer ${token}`)
            .end((err, res) => {
                expect(err).to.be.null;
                res.should.have.status(200);
                expect(res.body).to.be.an('array');
                done();
            });
    });

    it("get a tax-due with id", (done) => {
        chai.request(URL)
            .get(`/api/taxs/tax-dues/${taxDueId}`)
            .set("authorization", `Bearer ${token}`)
            .end((err, res) => {
                expect(err).to.be.null;
                res.should.have.status(200);
                res.body.should.be.a('object');
                done();
            });
    });

    it("update a tax-due status as DELAYED with id", (done) => {
        chai.request(URL)
            .put(`/api/taxs/${taxDueId}`)
            .set("authorization", `Bearer ${token}`)
            .send({
                status: "DELAYED"
            })
            .end((err, res) => {
                expect(err).to.be.null;
                res.should.have.status(200);
                res.body.should.be.a('object');
                done();
            });
    });

    it("should logout the taxAccountant", (done) => {
        chai.request(URL)
            .delete(`/api/logout`)
            .set("authorization", `Bearer ${token}`)
            .end((err, res) => {
                expect(err).to.be.null;
                res.should.have.status(200);
                res.body.should.be.a('object');
                token = "";
                userId = "";
                done();
            });
    });

    it("should login a user with role tax-payer (taxPayer1)", (done) => {
        chai.request(URL)
            .post(`/api/login`)
            .send({
                username: "taxPayer1",
                password: "test"
            })
            .end((err, res) => {
                expect(err).to.be.null;
                res.should.have.status(200);
                expect(res).to.have.header("token");
                token = res.header["token"]
                userId = res.body._id;
                res.body.should.be.a('object');
                done();
            });
    });

    it("get all of their tax-dues for tax-payer (taxPayer1)", (done) => {
        chai.request(URL)
            .get(`/api/taxs/tax-dues`)
            .set("authorization", `Bearer ${token}`)
            .end((err, res) => {
                expect(err).to.be.null;
                res.should.have.status(200);
                expect(res.body).to.be.an('array');
                done();
            });
    });

    it("pay their tax-due for tax-payer (taxPayer1)", (done) => {
        chai.request(URL)
            .get(`/api/taxs/tax-pay/${taxDueId}`)
            .set("authorization", `Bearer ${token}`)
            .end((err, res) => {
                expect(err).to.be.null;
                res.should.have.status(200);
                res.body.should.be.a('object');
                done();
            });
    });

    it("should logout the taxPayer1", (done) => {
        chai.request(URL)
            .delete(`/api/logout`)
            .set("authorization", `Bearer ${token}`)
            .end((err, res) => {
                expect(err).to.be.null;
                res.should.have.status(200);
                res.body.should.be.a('object');
                token = "";
                userId = "";
                done();
            });
    });

});

describe("Remove the test data", () => {

    before((done) => {
        chai.request(URL)
            .post(`/api/login`)
            .send({
                username: "admin",
                password: "test"
            })
            .end((err, res) => {
                token = res.header["token"]
                userId = res.body._id;
                done();
            });
    });

    after((done) => {
        chai.request(URL)
            .delete(`/api/logout`)
            .set("authorization", `Bearer ${token}`)
            .end((err, res) => {
                token = "";
                userId = "";
                done();
            });
    });

    it("should delete the taxAccountant user", (done) => {
        chai.request(URL)
            .delete(`/api/users/${taxAccountantId}`)
            .set("authorization", `Bearer ${token}`)
            .end((err, res) => {
                expect(err).to.be.null;
                res.should.have.status(200);
                res.body.should.be.a('object');
                done();
            });
    });

    it("should delete the taxPayer user", (done) => {
        chai.request(URL)
            .delete(`/api/users/${taxPayerId}`)
            .set("authorization", `Bearer ${token}`)
            .end((err, res) => {
                expect(err).to.be.null;
                res.should.have.status(200);
                res.body.should.be.a('object');
                done();
            });
    });

    it("should delete the taxDue", (done) => {
        chai.request(URL)
            .delete(`/api/taxs/${taxDueId}`)
            .set("authorization", `Bearer ${token}`)
            .end((err, res) => {
                expect(err).to.be.null;
                res.should.have.status(200);
                res.body.should.be.a('object');
                done();
            });
    });
});

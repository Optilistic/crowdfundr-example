const { expect } = require("chai");

describe("Crowdfundr", function () {

  let Crowdfundr
  let crowdfundr
  let alice
  let bob
  let charlotte

  beforeEach( async () => {
    [a, b, c] = await ethers.getSigners()
    alice = a
    bob = b
    charlotte = c
    Crowdfundr = await ethers.getContractFactory("Crowdfundr")
    crowdfundr = await Crowdfundr.deploy()
  })

  it("Should test compilation and deployment", async function () {
    expect(await crowdfundr).to.not.equal(undefined);
  });

  it("Should create a projects array", async function () {
    let projects = await crowdfundr.getProjects()
    expect(projects).to.deep.equal([])
  });

  it("Should ", async function () {
    
  });

  it("Should ", async function () {
    
  });

  it("Should ", async function () {
    
  });

});

const { expect } = require("chai")
const {utils} = ethers
const {parseEther} = utils

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

  const createGenericProject = async () => {
    await crowdfundr.createProject(parseEther('10'), 30)
  }

  it("Should test compilation and deployment", async function () {
    expect(await crowdfundr).to.not.equal(undefined);
  });

  it("Should create a projects array", async function () {
    let projects = await crowdfundr.getProjects()
    expect(projects).to.deep.equal([])
  });

  it("Should add a project to the projects array when a new project is created", async function () {
    await createGenericProject()
    let projects = await crowdfundr.getProjects()
    expect(projects.length).to.deep.equal(1)
  });

  it("Should ", async function () {
    
  });

  it("Should ", async function () {
    
  });

});

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

  const createGenericProject = async (signer = alice) => {
    let project = await crowdfundr.connect(signer).createProject(parseEther('10'), 30)
    let res = await project.wait()
    let address = res.events[0].address
    return await ethers.getContractAt("Project", address);
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
  
  it("Should correclty assign an owner to the new project", async function () {
    let project1 = await createGenericProject()
    // let project2 = await createGenericProject(bob)
    expect(await project1.owner()).to.deep.equal(alice.address)
    // expect(await project2.owner).to.deep.equal(bob.address)
  });

  it("Should correclty assign an owner to multiple projects", async function () {
    let project1 = await createGenericProject()
    let project2 = await createGenericProject(bob)
    expect(await project1.owner()).to.deep.equal(alice.address)
    expect(await project2.owner()).to.deep.equal(bob.address)
  });

  it("Should ", async function () {
  });

});

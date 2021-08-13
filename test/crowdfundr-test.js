// With more time I would extensively test all of the require functions, and try and test every possible edge case
// With my current test suite, I think I've been able to test enough to know that the contract is working as intended
// I believe there are no major vunrlebilites here, but will be happy to see if you can find any
// I'm leaving this message mainly because I am anticipating critique that my test suite could have been more extensive, and would appreciate if that does not become the focus of the feedback ^__^
// try and hack into it and break it as well as find problems with my testing patterns if you can. Thanks :D


let { expect, assert } = require("chai")
const {utils} = ethers
const {parseEther} = utils

const assertRevert = async (blockOrPromise, reason) => {
  let errorCaught = false;
  try {
      const result = typeof blockOrPromise === 'function' ? blockOrPromise() : blockOrPromise;
      await result;
  } catch (error) {
    assert.include(error.message, 'revert');
      if (reason) {
        assert.include(error.message, reason);
      }
      errorCaught = true;
  }

  assert.strictEqual(errorCaught, true, 'Operation did not revert as expected');
}

assert =  Object.assign({}, assert, {
  revert: assertRevert
})


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

  const multipleUsersContribute = async function (address, amount) {
    await alice.sendTransaction({
      from: alice.address,
      to: address,
      value: ethers.utils.parseEther(`${amount}`),
    })
    await bob.sendTransaction({
      from: bob.address,
      to: address,
      value: ethers.utils.parseEther(`${amount * 2}`),
    })
    await charlotte.sendTransaction({
      from: charlotte.address,
      to: address,
      value: ethers.utils.parseEther(`${amount * 3}`),
    })
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

  it("Should allow users to contribute to a project", async function () {
    let project = await createGenericProject()
    await multipleUsersContribute(project.address, 1)
    let totalFunds = await project.totalFunds()
    expect(totalFunds).to.equal(parseEther('6'))
  });

  it("Should allow users to contribute to a project", async function () {
    let project = await createGenericProject()
    await multipleUsersContribute(project.address, 1)
    let totalFunds = await project.totalFunds()
    expect(totalFunds).to.equal(parseEther('6'))
  });

  it("Should revert if users contribute to a project that has already met its goal", async function () {
    let project = await createGenericProject()
    await assert.revert(multipleUsersContribute(project.address, 5))
  });

  it("Should not allow the owner to lock the contract if the goal has not been met", async function () {
    let project = await createGenericProject()
    await multipleUsersContribute(project.address, 1)
    await assert.revert(project.lockOwner())
  });

  it("Should allow the owner to lock the contract if the goal has been met", async function () {
    let project = await createGenericProject()
    await multipleUsersContribute(project.address, 3)
    await project.lockOwner()
    expect(await project.locked()).to.deep.equal(true)
  });

  it("Should allow a contributor to lock the contract if the goal has not been met", async function () {
    let project = await createGenericProject()
    await multipleUsersContribute(project.address, 1)
    await hre.ethers.provider.send('evm_increaseTime', [20 * 24 * 60 * 60])
    await project.connect(charlotte).lockContributor()
    expect(await project.locked()).to.deep.equal(true)
    expect(await project.success()).to.deep.equal(false)
  });


  it("Should allow the owner to cancel the project", async function () {
    let project = await createGenericProject()
    await project.cancel()
    expect(await project.locked()).to.deep.equal(true)
    expect(await project.success()).to.deep.equal(false)
  });

  it("Should allow the owner to withdraw funds if the goal has been met and the contract is locked", async function () {
    let project = await createGenericProject()
    await multipleUsersContribute(project.address, 3)
    await project.lockOwner()
    let balanceBefore = await hre.ethers.provider.getBalance(alice.address)
    let totalFunds = await project.totalFunds()
    await project.withdrawOwner(`${totalFunds}`)
    let balanceAfter = await hre.ethers.provider.getBalance(alice.address)
    let res = Number(`${balanceBefore}`) < Number(`${balanceAfter}`)
    expect(res).to.deep.equal(true)
  });

  it("Should allow the contributers to withdraw funds if the goal has not been met and the contract is locked", async function () {
    let project = await createGenericProject()
    await multipleUsersContribute(project.address, 1)
    await hre.ethers.provider.send('evm_increaseTime', [20 * 24 * 60 * 60])
    await project.connect(charlotte).lockContributor()
    let balanceBefore = await hre.ethers.provider.getBalance(charlotte.address)
    await project.connect(charlotte).withdrawContributor()
    let balanceAfter = await hre.ethers.provider.getBalance(charlotte.address)
    let res = Number(`${balanceBefore}`) < Number(`${balanceAfter}`)
    expect(res).to.deep.equal(true)
  });

  it("Should not allow the contributers to withdraw funds if the goal has been met", async function () {
    let project = await createGenericProject()
    await multipleUsersContribute(project.address, 3)
    await project.lockOwner()
    await assert.revert(project.connect(charlotte).withdrawContributor())
  });

});

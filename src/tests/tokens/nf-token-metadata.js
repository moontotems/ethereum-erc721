
const { expect } = require('chai');

describe('nf-token-metadata', function() {
  let nfToken, owner, bob;
  const id1 = 1;
  const baseUri = 'http://talismoons.com/';
  const uri1 = `${baseUri}${id1}`;
  const newBaseUri = 'http://talismoons_new.com/';
  const newUri1 = `${newBaseUri}${id1}`;

  beforeEach(async () => {
    const nftContract = await ethers.getContractFactory('NFTokenMetadataTestMock');
    nfToken = await nftContract.deploy(
      'Foo',
      'F',
      baseUri
    );
    [owner, bob] = await ethers.getSigners();
    await nfToken.deployed();
  });

  it('correctly checks all the supported interfaces', async function() {
    expect(await nfToken.supportsInterface('0x80ac58cd')).to.equal(true);
    expect(await nfToken.supportsInterface('0x5b5e139f')).to.equal(true);
    expect(await nfToken.supportsInterface('0x780e9d63')).to.equal(false);
  });

  it('returns the correct contract name', async function() {
    expect(await nfToken.name()).to.equal('Foo');
  });

  it('returns the correct contract symbol', async function() {
    expect(await nfToken.symbol()).to.equal('F');
  });

  it('correctly sets baseUri on deploy', async function() {
    expect(await nfToken.baseUri()).to.equal(baseUri);
    await nfToken.connect(owner).mint(bob.address, id1);
    expect(await nfToken.tokenURI(id1)).to.equal(uri1);
  });

  it('correctly updates baseUri', async function() {
    await nfToken.connect(owner).setBaseUri(newBaseUri);
    await nfToken.connect(owner).mint(bob.address, id1);
    expect(await nfToken.tokenURI(id1)).to.equal(newUri1);
  });

  it('throws when non owner tries to set baseUri', async function() {
    await expect(nfToken.connect(bob).setBaseUri(baseUri)).to.be.revertedWith('018001');
  });

  it('correctly mints a NFT', async function() {
    expect(await nfToken.connect(owner).mint(bob.address, id1)).to.emit(nfToken, 'Transfer');
    expect(await nfToken.balanceOf(bob.address)).to.equal(1);
    await nfToken.connect(owner).setBaseUri(baseUri);
    expect(await nfToken.tokenURI(id1)).to.equal(uri1);
  });

  it('throws when trying to get URI of invalid NFT ID', async function() {
    await expect(nfToken.tokenURI(id1)).to.be.revertedWith('003002');
  });

  it('correctly burns a NFT', async function() {
    await nfToken.connect(owner).mint(bob.address, id1);
    expect(await nfToken.connect(owner).burn(id1)).to.emit(nfToken, 'Transfer');
    expect(await nfToken.balanceOf(bob.address)).to.equal(0);
    await expect(nfToken.ownerOf(id1)).to.be.revertedWith('003002');
    await expect(nfToken.tokenURI(id1)).to.be.revertedWith('003002');
  });

});

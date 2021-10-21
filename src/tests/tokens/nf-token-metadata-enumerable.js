
const { expect } = require('chai');

describe('nf-token-enumerable', function() {
  let nfToken, owner, bob, jane, sara;
  const id1 = 123;
  const id2 = 124;
  const id3 = 125;
  const baseUri = 'http://moontotems.com/';
  const uri1 = `${baseUri}${id1}`;
  const uri2 = `${baseUri}${id2}`;
  const uri3 = `${baseUri}${id3}`;
  const newBaseUri = 'http://moontotems_new.com/';
  const newUri1 = `${newBaseUri}${id1}`;

  beforeEach(async () => {
    const nftContract = await ethers.getContractFactory('NFTokenMetadataEnumerableTestMock');
    nfToken = await nftContract.deploy(
      'Foo',
      'F',
      baseUri
    );
    [owner, bob, jane, sara] = await ethers.getSigners();
    await nfToken.deployed();
  });

  it('correctly checks all the supported interfaces', async function() {
    expect(await nfToken.supportsInterface('0x80ac58cd')).to.equal(true);
    expect(await nfToken.supportsInterface('0x5b5e139f')).to.equal(true);
    expect(await nfToken.supportsInterface('0x780e9d63')).to.equal(true);
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

  it('returns the correct NFT id 1 url', async function() {
    await nfToken.connect(owner).setBaseUri(baseUri);
    await nfToken.connect(owner).mint(bob.address, id1);
    expect(await nfToken.tokenURI(id1)).to.equal(uri1);
  });

  it('throws when trying to get URI of invalid NFT ID', async function() {
    await expect(nfToken.tokenURI(id1)).to.be.revertedWith('NOT_VALID_NFT');
  });

  it('correctly mints a NFT', async function() {
    expect(await nfToken.connect(owner).mint(bob.address, id1)).to.emit(nfToken, 'Transfer');
    expect(await nfToken.balanceOf(bob.address)).to.equal(1);
    expect(await nfToken.totalSupply()).to.equal(1);
  });

  it('returns the correct token by index', async function() {
    await nfToken.connect(owner).mint(bob.address, id1);
    await nfToken.connect(owner).mint(bob.address, id2);
    await nfToken.connect(owner).mint(bob.address, id3);
    expect(await nfToken.tokenByIndex(0)).to.equal(id1);
    expect(await nfToken.tokenByIndex(1)).to.equal(id2);
    expect(await nfToken.tokenByIndex(2)).to.equal(id3);
  });

  it('throws when trying to get token by non-existing index', async function() {
    await nfToken.connect(owner).mint(bob.address, id1);
    await expect(nfToken.tokenByIndex(1)).to.be.revertedWith('INVALID_INDEX');
  });

  it('returns the correct token of owner by index', async function() {
    await nfToken.connect(owner).mint(bob.address, id1);
    await nfToken.connect(owner).mint(bob.address, id2);
    await nfToken.connect(owner).mint(sara.address, id3);
    expect(await nfToken.tokenOfOwnerByIndex(bob.address, 1)).to.equal(id2);
  });

  it('throws when trying to get token of owner by non-existing index', async function() {
    await nfToken.connect(owner).mint(bob.address, id1);
    await expect(nfToken.tokenOfOwnerByIndex(bob.address, 1)).to.be.revertedWith('INVALID_INDEX');
  });

  it('correctly burns a NFT', async function() {
    await nfToken.connect(owner).mint(bob.address, id1);
    expect(await nfToken.connect(owner).burn(id1)).to.emit(nfToken, 'Transfer');
    expect(await nfToken.balanceOf(bob.address)).to.equal(0);
    await expect(nfToken.ownerOf(id1)).to.be.revertedWith('NOT_VALID_NFT');
    await expect(nfToken.tokenByIndex(0)).to.be.revertedWith('INVALID_INDEX');
    await expect(nfToken.tokenOfOwnerByIndex(bob.address, 0)).to.be.revertedWith('INVALID_INDEX');
  });

});


const { expect } = require('chai');

describe('moon-totems', function() {
  let nfToken, owner, bob, jane, sara;
  const name = 'MoonTotems';
  const symbol = 'TOTEM';

  const MIN_TOKEN_ID = 0;
  const MAX_TOKEN_ID = 9457;

  const id1 = 1;
  const id2 = 2;
  const id3 = 3;

  const TOTEM_MINT_PRICE_correct = ethers.utils.parseEther('0.1');
  const TOTEM_MINT_PRICE_larger = ethers.utils.parseEther('0.11');
  const TOTEM_MINT_PRICE_smaller = ethers.utils.parseEther('0.09');

  const TOTEM_MINT_PRICE_new_correct = ethers.utils.parseEther('0.2');
  const TOTEM_MINT_PRICE_new_larger = ethers.utils.parseEther('0.21');
  const TOTEM_MINT_PRICE_new_smaller = ethers.utils.parseEther('0.19');

  const baseUri = 'http://moontotems.com/';
  const uri1 = `${baseUri}${id1}`;
  const uri2 = `${baseUri}${id2}`;
  const uri3 = `${baseUri}${id3}`;
  const uri_MIN_TOKEN_ID = `${baseUri}${MIN_TOKEN_ID}`;
  const uri_MAX_TOKEN_ID = `${baseUri}${MAX_TOKEN_ID}`;

  const newBaseUri = 'http://moontotems-new.com/';
  const newUri1 = `${newBaseUri}${id1}`;
  const newUri2 = `${newBaseUri}${id2}`;
  const newUri3 = `${newBaseUri}${id3}`;

  beforeEach(async () => {
    const nftContract = await ethers.getContractFactory('MoonTotems');
    nfToken = await nftContract.deploy(
      name,
      symbol,
      baseUri
    );
    [owner, bob, jane, sara] = await ethers.getSigners();
    await nfToken.deployed();
  });

  it('returns the correct contract name', async function() {
    expect(await nfToken.name()).to.equal(name);
  });

  it('returns the correct contract symbol', async function() {
    expect(await nfToken.symbol()).to.equal(symbol);
  });

  it('returns the correct MIN_TOKEN_ID', async function() {
    expect(await nfToken.MIN_TOKEN_ID()).to.equal(MIN_TOKEN_ID);
  });

  it('returns the correct MAX_TOKEN_ID', async function() {
    expect(await nfToken.MAX_TOKEN_ID()).to.equal(MAX_TOKEN_ID);
  });

  it('returns 0.1 ETH as initial mint pice', async function() {
    const initialMintPorice = ethers.utils.parseEther('0.1');
    expect(await nfToken.TOTEM_MINT_PRICE()).to.equal(initialMintPorice);
  });

  it('minting is not active after deploy', async function() {
    expect(await nfToken.MINT_IS_ACTIVE()).to.equal(false);
  });

  it('owner can flip mint flag', async function() {
    await nfToken.connect(owner).flipMintFlag();
    expect(await nfToken.MINT_IS_ACTIVE()).to.equal(true);
    expect(await nfToken.connect(owner).flipMintFlag()).to.emit(nfToken, 'MintFlagUpdate');
  });

  it('only owner can flip mint flag', async function() {
    await expect(nfToken.connect(bob).flipMintFlag()).to.be.revertedWith('NOT_CURRENT_OWNER');
  });

  it('owner can flip mint flag multiple times', async function() {
    await nfToken.connect(owner).flipMintFlag();
    expect(await nfToken.MINT_IS_ACTIVE()).to.equal(true);
    await nfToken.connect(owner).flipMintFlag();
    expect(await nfToken.MINT_IS_ACTIVE()).to.equal(false);
    await nfToken.connect(owner).flipMintFlag();
    expect(await nfToken.MINT_IS_ACTIVE()).to.equal(true);
  });

  it('cant mint when mint flag is false', async function() {
    expect(await nfToken.MINT_IS_ACTIVE()).to.equal(false);
    await expect(nfToken.connect(bob).mint(bob.address, id2, { value: TOTEM_MINT_PRICE_correct })).to.be.revertedWith('Minting is not active');
  });

  it('anyone can mint', async function() {
    await nfToken.connect(owner).flipMintFlag();
    await nfToken.connect(bob).mint(bob.address, id1, { value: TOTEM_MINT_PRICE_correct });
  });

  it('minting with incorrect mint price throws', async function() {
    await nfToken.connect(owner).flipMintFlag();
    await expect(nfToken.connect(bob).mint(bob.address, id2, { value: TOTEM_MINT_PRICE_larger })).to.be.revertedWith('Amount needs to be equal to TOTEM_MINT_PRICE');
    await expect(nfToken.connect(bob).mint(bob.address, id3, { value: TOTEM_MINT_PRICE_smaller })).to.be.revertedWith('Amount needs to be equal to TOTEM_MINT_PRICE');
  });

  it('owner can update mint price', async function() {
    await nfToken.connect(owner).setNewMintPrice(TOTEM_MINT_PRICE_new_correct);
    expect(await nfToken.TOTEM_MINT_PRICE()).to.equal(TOTEM_MINT_PRICE_new_correct);
    await nfToken.connect(owner).flipMintFlag();
    await expect(nfToken.connect(bob).mint(bob.address, id1, { value: TOTEM_MINT_PRICE_new_larger })).to.be.revertedWith('Amount needs to be equal to TOTEM_MINT_PRICE');
    await expect(nfToken.connect(bob).mint(bob.address, id2, { value: TOTEM_MINT_PRICE_new_smaller })).to.be.revertedWith('Amount needs to be equal to TOTEM_MINT_PRICE');
    await nfToken.connect(bob).mint(bob.address, id1, { value: TOTEM_MINT_PRICE_new_correct });
    await nfToken.connect(bob).mint(bob.address, id2, { value: TOTEM_MINT_PRICE_new_correct });
  });

  it('only owner can update mint price', async function() {
    await expect(nfToken.connect(bob).setNewMintPrice(TOTEM_MINT_PRICE_new_correct)).to.be.revertedWith('NOT_CURRENT_OWNER');
  });

  it('returns the correct contract baseUri', async function() {
    expect(await nfToken.baseUri()).to.equal(baseUri);
  });

  it('returns the correct tokenUri', async function() {
    await nfToken.connect(owner).flipMintFlag();
    await nfToken.connect(bob).mint(bob.address, id1, { value: TOTEM_MINT_PRICE_correct });
    await nfToken.connect(bob).mint(bob.address, id2, { value: TOTEM_MINT_PRICE_correct });
    expect(await nfToken.tokenURI(id1)).to.equal(uri1);
    expect(await nfToken.tokenURI(id2)).to.equal(uri2);
  });

  it('throws when trying to get URI of invalid NFT ID', async function() {
    await expect(nfToken.tokenURI(id1)).to.be.revertedWith('NOT_VALID_NFT');
  });

  it('correctly updates baseUri', async function() {
    await nfToken.connect(owner).setBaseUri(newBaseUri);
    await nfToken.connect(owner).flipMintFlag();
    await nfToken.connect(bob).mint(bob.address, id1, { value: TOTEM_MINT_PRICE_correct });
    await nfToken.connect(bob).mint(bob.address, id2, { value: TOTEM_MINT_PRICE_correct });
    expect(await nfToken.tokenURI(id1)).to.equal(newUri1);
    expect(await nfToken.tokenURI(id2)).to.equal(newUri2);
  });

  it('only owner can set baseUri', async function() {
    await expect(nfToken.connect(bob).setBaseUri(baseUri)).to.be.revertedWith('NOT_CURRENT_OWNER');
  });

  it('correctly mints a NFT', async function() {
    // check contract balance
    let contractBalance_beforeMint = await ethers.provider.getBalance(nfToken.address);
    contractBalance_beforeMint = contractBalance_beforeMint.toString();
    expect(contractBalance_beforeMint).to.equal('0');

    await nfToken.connect(owner).setBaseUri(baseUri);
    await nfToken.connect(owner).flipMintFlag();
    expect(await nfToken.connect(bob).mint(bob.address, id1, { value: TOTEM_MINT_PRICE_correct })).to.emit(nfToken, 'Transfer');
    expect(await nfToken.balanceOf(bob.address)).to.equal(1);
    expect(await nfToken.tokenURI(id1)).to.equal(uri1);

    // check contract balance
    let contractBalance_afterMint = await ethers.provider.getBalance(nfToken.address);
    contractBalance_afterMint = contractBalance_afterMint.toString();
    expect(contractBalance_afterMint).to.equal(TOTEM_MINT_PRICE_correct);
  });

  it('correctly mints MIN_TOKEN_ID', async function() {
    await nfToken.connect(owner).setBaseUri(baseUri);
    await nfToken.connect(owner).flipMintFlag();
    await nfToken.connect(bob).mint(bob.address, MIN_TOKEN_ID, { value: TOTEM_MINT_PRICE_correct });
    expect(await nfToken.balanceOf(bob.address)).to.equal(1);
    expect(await nfToken.ownerOf(MIN_TOKEN_ID)).to.equal(bob.address);
    expect(await nfToken.tokenURI(MIN_TOKEN_ID)).to.equal(uri_MIN_TOKEN_ID);
  });

  it('correctly mints MAX_TOKEN_ID', async function() {
    await nfToken.connect(owner).setBaseUri(baseUri);
    await nfToken.connect(owner).flipMintFlag();
    await nfToken.connect(bob).mint(bob.address, MAX_TOKEN_ID, { value: TOTEM_MINT_PRICE_correct });
    expect(await nfToken.balanceOf(bob.address)).to.equal(1);
    expect(await nfToken.ownerOf(MAX_TOKEN_ID)).to.equal(bob.address);
    expect(await nfToken.tokenURI(MAX_TOKEN_ID)).to.equal(uri_MAX_TOKEN_ID);
  });

  it('throws when trying to mint token smaller than MIN_TOKEN_ID', async function() {
    const invalidTokenId = MIN_TOKEN_ID - 1;
    await nfToken.connect(owner).flipMintFlag();
    await expect(
      nfToken.connect(bob).mint(bob.address, invalidTokenId, { value: TOTEM_MINT_PRICE_correct })
    ).to.be.revertedWith('TokenId needs to be >= MIN_TOKEN_ID');
  });

  it('throws when trying to mint token larger than MAX_TOKEN_ID', async function() {
    const invalidTokenId = MAX_TOKEN_ID + 1;
    await nfToken.connect(owner).flipMintFlag();
    await expect(
      nfToken.connect(bob).mint(bob.address, invalidTokenId, { value: TOTEM_MINT_PRICE_correct })
    ).to.be.revertedWith('TokenId needs to be <= MAX_TOKEN_ID');
  });

  it('correctly burns a NFT', async function() {
    await nfToken.connect(owner).flipMintFlag();
    await nfToken.connect(bob).mint(bob.address, id1, { value: TOTEM_MINT_PRICE_correct });
    expect(await nfToken.connect(bob).burn(id1)).to.emit(nfToken, 'Transfer');
    expect(await nfToken.balanceOf(bob.address)).to.equal(0);
    await expect(nfToken.ownerOf(id1)).to.be.revertedWith('NOT_VALID_NFT');
    await expect(nfToken.tokenURI(id1)).to.be.revertedWith('NOT_VALID_NFT');
  });

  it('only token owner or operator can burn NFT', async function() {
    await nfToken.connect(owner).flipMintFlag();
    await nfToken.connect(bob).mint(bob.address, id1, { value: TOTEM_MINT_PRICE_correct });
    await expect(nfToken.connect(jane).burn(id1)).to.be.revertedWith('NOT_OWNER_APPROVED_OR_OPERATOR');
  });

  it('owner can withdraw eth', async function() {
    const highMintPrice = ethers.utils.parseEther('100');
    await nfToken.connect(owner).setNewMintPrice(highMintPrice);
    await nfToken.connect(owner).flipMintFlag();
    await nfToken.connect(bob).mint(bob.address, id1, { value: highMintPrice });

    // check contract balance before
    let contractBalance_beforeWithdraw = await ethers.provider.getBalance(nfToken.address);
    contractBalance_beforeWithdraw = contractBalance_beforeWithdraw.toString();
    expect(contractBalance_beforeWithdraw).to.equal(highMintPrice);

    // check owner balance before
    let ownerBalance_beforeWithdraw = await ethers.provider.getBalance(owner.address);
    ownerBalance_beforeWithdraw = ownerBalance_beforeWithdraw.toString();

    // owner withdraw
    await nfToken.connect(owner).withdraw();

    // check owner balance after
    let ownerBalance_afterWithdraw = await ethers.provider.getBalance(owner.address);
    ownerBalance_afterWithdraw = ownerBalance_afterWithdraw.toString();

    // check contract balance after
    let contractBalance_afterWithdraw = await ethers.provider.getBalance(nfToken.address);
    contractBalance_afterWithdraw = contractBalance_afterWithdraw.toString();

    // TODO: find out how to get 'gasUsed' of transaction
    console.log(`
      contractBalance beforeWithdraw:   ${contractBalance_beforeWithdraw}
         ownerBalance beforeWithdraw:  ${ownerBalance_beforeWithdraw}
         ownerBalance  afterWithdraw: ${ownerBalance_afterWithdraw}
      contractBalance  afterWithdraw:                       ${contractBalance_afterWithdraw}
    `);

    expect('TODO').to.be.equal('check the result of this test manually');
  });

  it('only owner can withdraw eth', async function() {
    await expect(nfToken.connect(bob).withdraw()).to.be.revertedWith('NOT_CURRENT_OWNER');
  });

});

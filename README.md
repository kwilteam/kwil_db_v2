Setting up your environment:

Once you have the repo downloaded, simply run npm install then npm start to get it set up.  Right now there is a config issue that appears that will require restructuring a ton of imports.  As a temporary work-around, the first time you run the application, it will throw an error.  This will then create the necessary config files.  The application will auto-create any missing files (namely env, Arweave JWK, public folder (worth noting we are removing filesystem support in our next iteration so this will go away), and bundles)

The two of these you now have to set up are for the .env and the Arweave JWK.

## .env

Once you have failed initialization once, the .env file should look mostly full.  The only things you need to fill out are an EVM private key (for the registry), the api secret (this can be literally anything, it's just used to keep access credentials encrypted in-case of a data leak), and the data sets you want to sync.  Here is how one could look:

```
ARWEAVE_GRAPH_HOST = https://arweave.net
NODE_PORT = 1984
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=password
DATABASE_NAME=postgres
DATABASE_CONNECTOR= postgresql
NODE_ENV = production
BUNDLE_VERSION = 1.3
SYNCED_DATA_MOATS = test
SYNC = false
SHOVE = false
ALLOW_REGISTRATION = false
UPCHARGE_RATE = 1.3
        
KEY_SECRET = apisecret
PRIVATE_KEY = 2056d52c3fa968e426a3424a21f8020092e5075bcad423805fbd382bcff20a65
REGISTRY_ADDRESS = https://registry.kwil.xyz
ACCEPTED_TOKENS = USDC_ethereum USDC_polygon KRED_polygon
```

## Arweave JWK

The key.json file will be empty.  You simply need to paste an Arweave JWK in it.  For example:

```
{
    kty: 'RSA',
    n: 'mq1rJXtoqq7JgNvXOwTOqVvyVAbr25v2U4IZ2eu355nzUdD-izujhVMwhFXD6tGv7FeD1p82PDW4gqSW0TA-4HDDCvX-jJ38MZGhqEPn4Ryr8jG8wrCb36h3k2qGNrlS4BlZjHcuVzttTXvnoaIRaGtOw9ZpnbNgflKuXvWpbhjDvE_cCl79OVMhKaapyhqbZE1kYvzPAZQ30qnEhq_V9sMdLk_Stx73lR9A0llfbgaXr_6KNpGYP92RuyXofVpSiq8zglUOFrtFsU8FPqMxmKjwadLuZrcr4XutXdDFjtwvE56KslVrxthSuQZFbbuGCqcq2TxinEaaIwRIAZg1mw0NSQA_xFhp99Cf9BeXmDUdoPjrc4gqqM_t9kEOAs0vdzfo2TTZEpzb31Fwj7GndcqvGaEd_bNjmPapgtgTumzoNWYSJzpvoN0gmRQhFI9TazeCLUu9EQwqylo0DnowsbLHgcUMggkmI-VMEFHSHYUO7SUMXOZfwGviCLwE3gyLDmuC3fEbXvHMSQ_AU4rMk4L5i2SeSCnbVHDkp-qIDfJ8qIg3X9f7LkRBP-ZjkAeCecOvub54FUgHsd-pMnRkR3rsqOCn3MYcIypIGBQYsmG6U-UeGP8pRY2Z9znc_HNMPMxhalu7sP2mD654xfvLePWZyulrtDZnYsIlOuVU4QM',
    e: 'AQAB',
    d: 'ENUmf-G6NjjnPNqvxYB0bQHQkUxfhnqmh9f0sD5yuQWL8S9pRAWteejfsscSlw9SscmkU0roQA0oky8OKp2xegNLdnnmxa67rzlF-mXJajoQjD7VZ-qITAKtYKGLEZGBb1nS4PJnXJ7e-jutrW1Rr6dd3voKbFsE-TpON49MbOrNAkU-kPJdZEujpEC64X-bwYKalhsk--sBWC-Zb37bLgt1tYCCUeNQ1i2chEetlu-oukJdECswAmM-ZLtvXZTivqzqUhine9nNb8pFq9deolpgL2QBBbSRVex7pWX-2dkkVmI-fcHGBNGtzuzbyWFK6QXgJ9vmb1NPmtfwbhv-WUHwdRD5mksPWoJC4_kp_jB8Z3cdyj_pmcInSud-k9bGrB6gREqZ1wBR5tG4yGKZ9dwRQ-SfcDYrfv2ld0clF5sjBZT0l1XHwpogoOWMNcpmpLeZZb-b9wOOwQyIIZwVqp3yxZ7aFAzG1QI8llFb4r0m8ptruCGEh_SDWl2cHGYtyt6OuTQsfBU1ErOhNzU12L2ISw_y35pshBLAHf72PsUHmGCrEVOlBuMsU_kQlVoN0qElCpa7fc81v4N_Lq1IXWoHodgB_FoFYuSaNSKQ8lDda8eGTp1H-EzlRPv3wkEhEaQupTHTKawIt0KrrdcIcPoxhh0Cbo7HeCQbIeSP9uE',
    p: 'zdpqs16SBFI8kYkcvs8nDLA9SF09AmR5KzJ8n7RPMTdsAPyQYHyJKVA3z_qRsruAz9j_RWi6BfKYJd042JXmC2OHYAD0nIiIv_ysB657yN8jSs8yKxIq2glA02WFrK8-9jJi1-XLARzwYHPGVj_bXVvDx5JsTXDKWkskINqz53V98ui2F0oxeZuvKGoerkbfSSVB-_QW27HpIiboF1z7IH8XlhG3vMTrthfKw5iPPpfwr-BkXEKj3xlLP4EIEHiSRHZY0WfubvwA4-SVq0YLe0GAJTQUQK2bahKVLP9RTU3RPzdKpNDK7cdjPXxSa4tlYlvDxZC2KHyzKydyvwTC_Q',
    q: 'wFuJZOevEv4eQekaZVjnqiEB7hsDon7Eiv58-eKOOvalzTxL4qSOQWeA5YyaFmJkd6MiVLJc47l38c36k8toHV4szdmfXS5wWMC_mYuaZ4iOoNBdus8hXgCi0m4d1Eeh_NsPExES9mp7s06T2wsl1Tmz-glj_WoZNTi-9DzmuXco8EoMLglzeZWKOni0_V0lGcYx2nPvpLw1x3vR8uPwrLgGGKVeo_UgzqgfzOnJIBkHwB2X3lRK-j-RgsUpgxySPL32esvDaQKq49rCtGnzpk1MwI6gQQvnamZvpVG-WyRecN6NZDQkQpxdo5BRlOgQCOL8_6d2ndpbUxrbQatz_w',
    dp: 'eOXgaLwQEc2imO7oHQBYtNEFDO0FmdQcfcxG-RzSrdsY6XNr7970R3k_bjyBOXF585hERCV_q2KRDRvh-QIAe4vWxAGLqCtf9TGWb2SAerbiaVtK4ZTn6eopUn57hbHezoVFG_tvwJWYb21PfPRAB5KPZzSNuuWVUnZzH4CSzEtqzzDxULhYWk2fD6NTpZMmLDVfjXQLwLe6bj5fbOlE7A74cUCyooEc1nMeuMVuy5o81254Qt84kxyt3vwPGm1VqjO_ci0SEcibVTy40kBvGdKcSj1N77aGYkPLrQO-YiJj1DbK9gVSSVgi5sePOG5D-wJd9jhJY3npWFzwvVM0mQ',
    dq: 'G7dUxbBIXqE09OREhGPaBX56C7fivzAq26gtk8fcHIzbeQX-HSr-wFfMj8bBkQYeWcqssK1-iuV3beTy_Qaq-shOBl8cAk4lq_Qh51rhJZfcjTlYuAkOUsAetdld_O9RXOCnfGTSaaUQK9bfoQkrK10EHLvrp2D5PtztTr3TtNeBk5XnyV5dQCCW6TPpSDR6mwsetc5MslzYFuU1bB0B2bEuV7DEQTWZw40f_-OTskdJAZqB_mwA3av5KHGGOLkOLShl8m2Xu3LB8tDbiylVDRpIO9qRJq4zavZVkemEVxeXcAXxM4X7z4k-SMoLpzwEy3MBZ0jW44nJ7OCKxRySOw',
    qi: 'mM3vjkYiLb5qSbfsLrlNfFi04ZyG3WYUfRI7nSGAA4yCAXW7Jr2H8ekOJ0-7e9YWVslJQKfnIdPiPLCrOlY_k1_EolTBUE-7u_Vtk69BJXa3Cb5bB4TaUd5L0VlAuPRso1yJh0PiIxTI5Yznr2LpV67zezPHdFWGxUI0HttSvVo1GhQ9oekIDY-m7BMBsCXdw1kOmoSOvgUJ_32IjzXMJqHiZEVyhcOsM6yDELwbvHDDsrMGEGi3n6D0k5hAKGlXajXfVddCjzcLYsgKcBADYbPjiS2vod0gfwQ4cPzA9etB4TsN60m0fREhCtgGJZnggcMjY3pucpseSzGKPOE8tw'
  }
```
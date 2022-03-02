/*
    Key: '***' means to use code if test moat changed.
*/
const { checkQuerySig, createSignedQuery } = require('./signatures');
// Imports necessary packages for test moat change ***
// const rs = require('jsrsasign');
// const jssha = require('jssha')
// const b64 = require('base64url')

/*
    Change readme so no extra await.
*/

// Signs data transaction with sample private key. ***
// const sign = (_data, _privateJWK) => {
//     const privateKey = rs.KEYUTIL.getKey(_privateJWK);
//     var sig = new rs.crypto.Signature({ alg: 'SHA384withRSA' });
//     sig.init(privateKey);
//     sig.updateString(_data);
//     let signature = sig.sign();
//     return signature;
// };

// Generates sha384 hash. ***
// const sha384 = (_text) => {
//     try {
//         if (_text != null){
//     const shaObj = new jssha('SHA-384', 'TEXT', { encoding: 'UTF8' });
//     shaObj.update(_text);
//     const b64Hash = shaObj.getHash('B64');
//     return b64.fromBase64(b64Hash);
//     } else {
//         return ''
//     }
//     } catch(e) {
//         console.log(e)
//         throw new Error('Tried to hash something that is not a string. Make sure all inputs are correctly formatted.')
//     }
// };

describe("checkQuerySig", () => {

    // Parameter initialization specific to current test moat (currently test_moat1 on justin localhost)
    const secret = 'Rz_q-[^U%N.UNu<{p{;7pD<0[0*gJ&dr';
    let moatModulus = '5TqJoW4YFYrJNfxNkMvL5bj9lV1ObAd66Rr5NgOkzkpOC5UEoPNKqz2ZDuwgnQVfNfIzB44UXLMpLyK1RMDs2aisVILg-wU1l8n6m_zxXw6chyNbGwvp19lT-XiR0xydMfNPf2r-fj6LA95qHmOUWowk5CHgFYCvcHbdQlC3FaExzZkGLxulaa2NifhojziwQ4myDCK7DjBA7GQ_sks3LtNz2oO4NLyLvVec3BgISmLTPTnDFFoyN4NzBI92EJB9aFQGx3S3csEFaiqQGa1eZ2bIr1uQ0YaR6Euasje746CoCA_fj9GRsFFPCUVaxQItotKIQ4BWZw6ZUjP4AC0M3oUq08RNr0Utr8mlq3MuMhsYRzni_ulNvmsFP87-DArMWPhtStwsFXWmbWLUbJ_OeigYMYF0Of2Qq9hAzIYBnwpK7coQQJNnZ9nqI3b50UvA4VWIkzvkM2h5FDR6YxRcGrL--5T0mQOBtJi3cu8RynxLsb5uZeYTGVCkttg9c2sfgqOhV48fctIRbtRKgvabhPwKQAqollBdD_WPx4-aojCM2YvFUP9UTJJ-PhC-98gxgqalA1Jw10je18KZKRA5zwmbXrLx1nE5Nc7lvYp5y8hJ1C_yuedMsmHZsDHD-tqq3_kbtTPKNPUK72V8HVrUQRBzdGB6cFIxMSmjLt6d7WM';

    // Initializing used parameters in tests
    const queryID = 'dt:Vf$g0xkz!nUtQkrqJ}:WJ*=6$a-R2~js!RC(L/?O9y~iv!q>Jz^P]B1DKP%E&';
    const timestamp = '1646255865503';
    const testQuery = 'CREATE TABLE IF NOT EXISTS yuh;';
    const testHash = 'P6CfPcla9WaIGINdB1bAE6RJ4euTSkOCQ1VR9_5e7ae_RKi8W8S1nI7buHr4A-xi';

    // Creates testHash for current testing moat ***
    // const testHash = console.log(sha384(testQuery + timestamp + secret));
    
    // Creating mock getMoatModulus function that returns moatModulus for test_moat1
    const getMoatModulus = jest.fn();
    getMoatModulus.mockReturnValue(moatModulus);

    it("Returns true with correctly inputted data/signature object", async () => {

        // Valid private key signature.
        const signature = 'c013896b7248d2da6f9008f4a32ffe43041fb3b12db4819bcc312ebd948a7752e7068bd3394655fa3f6b20c23c5a9f6ce9e588ea62e1e784544374780678f17e31c88f691928e9a7225b1dfe5e7dfe928d4b4ad7ad19304e8c3519de28dbec9ec9c9da2c0560b3a4720bf58b0ebd2da77beac829c15445329a149e406ab1ec2828cd8f8d2b271d54cf9c70eb84222b178f6085a5a91f630a48fd5f23c3efcd7124eb331c69e85d79bd865aca18ee72d3fee99aaa167e2f1b8c9e891a831d5cc441e975d3d8d66e9cb5dcc5e7e302bb6a172b62e5e538a457df375121e7f7040c24c0274e93735f60128588ed70f7d79c0aa9b68e0fbcb9393d0da3ef82caa874e11ad94a100bfb4c1645232ddb28066c7bea9a8e635d2274381b5c56d882c1df828c2919fa332a8ea62496608fff83cf2a820519df91161c3e039bbf392db81e2372b06369f0782ed04129f4f58a21517b95b2911ee4ea672286a360ac6ccf1550db6cafb638060c7f2c4a1ab861527cc78e00c2ed7b7ffac8b095b85f0b98b3f63feaf217ae786f863486acbef9c4b204b5d22be8614516c91a515e1a4ec281b80c5b1406d90ef79600ad48349bf89f60369fae50f62d19bdfa06115a83bb8b03efaf9114583c51c185e518ffa32ca7546595b4966b57e2ee72b6fc5b7f86f4c39851bede81b1d3a8feb60d8b1599ce4d8a02c7cf462e2a672cbc4e9de1dce3';

        // Adding necessary valid private key credentials for current test_moat and getting necessary signature. ***
        // const privateJWK = {
        //     kty: 'RSA',
        //     n: '5TqJoW4YFYrJNfxNkMvL5bj9lV1ObAd66Rr5NgOkzkpOC5UEoPNKqz2ZDuwgnQVfNfIzB44UXLMpLyK1RMDs2aisVILg-wU1l8n6m_zxXw6chyNbGwvp19lT-XiR0xydMfNPf2r-fj6LA95qHmOUWowk5CHgFYCvcHbdQlC3FaExzZkGLxulaa2NifhojziwQ4myDCK7DjBA7GQ_sks3LtNz2oO4NLyLvVec3BgISmLTPTnDFFoyN4NzBI92EJB9aFQGx3S3csEFaiqQGa1eZ2bIr1uQ0YaR6Euasje746CoCA_fj9GRsFFPCUVaxQItotKIQ4BWZw6ZUjP4AC0M3oUq08RNr0Utr8mlq3MuMhsYRzni_ulNvmsFP87-DArMWPhtStwsFXWmbWLUbJ_OeigYMYF0Of2Qq9hAzIYBnwpK7coQQJNnZ9nqI3b50UvA4VWIkzvkM2h5FDR6YxRcGrL--5T0mQOBtJi3cu8RynxLsb5uZeYTGVCkttg9c2sfgqOhV48fctIRbtRKgvabhPwKQAqollBdD_WPx4-aojCM2YvFUP9UTJJ-PhC-98gxgqalA1Jw10je18KZKRA5zwmbXrLx1nE5Nc7lvYp5y8hJ1C_yuedMsmHZsDHD-tqq3_kbtTPKNPUK72V8HVrUQRBzdGB6cFIxMSmjLt6d7WM',
        //     e: 'AQAB',
        //     d: 'FN0gG8ZWgNdx-uzs7mnuNAmDYy3r7l87662d0zG_tVsEAX_dvPyH5lAj9zy8ty3-_Xz-8ggXiFxyOi0RjKF2rVTx4ntLGO3fc-JZYgtCuOEulAo-x5ZtAU1xnDpCI5HuKNa5fKJzaXAt3PtIc12i6h7pWK5QpARjc3wOJXQNRfW2_7yW2IDOrHC0ekNW2PpS6MLGpt4eYms37YwuU_8Olb9_QvtML9ida21nBI1Xa9XU3jS8scSH34-iT17zYwyTrYRAXbUc4V_6KzCWjw-9kPHFAFj4NGnoK9l9ygzSmCRORvWS5pcviHnOFMzwNxA8sR4yctpigtzMTbQXNYTkL8yY_unqEwjMOsby6TvLiUnj4bqKKV9i03-rw8mr7L2oCN0ANhLUHypglnfwr-V4cTjDWAYw9fyBMSKZl5gucsnOykoX5WeFEjgQwY9A1pQnoa_kqy-Tpl5zRRPjALNRuqtij8WTdifd8JA-8Cs_OnZdqZDZjc4WbPD5_NKhB06AxjjRWdEEHbGEQvlFJkJ9nxH7UpX7I81j7KlcBKQKg2TDtt-n0OEPmRWcw4mXt-T86_kdtgKDtommtw-pDtzdTUSoikY8O-5Ja66fo9GvAhdkTp57rhU_Z2-U8Qhb5hUntRPzQ59PPY2ukt8IVkIiHRmx_UHL-qawwW3ECu3Y3DE',
        //     p: '-AI8lkeXh_socroxATJB6n5oIh92R8hrl1x0kVI03FwCc2rfUZ2YOuXEU_Go64be9BFBCFTJlVPwefwMPe0-YVmIgB4fHfBnetQJUf32ss4UCQtoSaHp8_dRB47qqla95umksO46FsMdS1w8dLx_yNOv-GlqgEEX9wZIAUyRVIRkLSDU1qCn19eoOmVprvUeZRfghRrkeBJ--uyJShrUrka-iMT7KnlXr4sAeJ0E5FOH05KVIlCtHRjmLC3X-9v7BoWtebM_uVyTtD4NSmLswjiq8mEkwj_e5wB74QKF0hoBrUdQqIpEgtyThdnfzKQAzrdYb2GyIM-YUqZeoukyGw',
        //     q: '7J1jgvUDktOzR2WyuNmZ3YygX3ubypV3HP5D0alVaxcXWB10YWQLZGSGL9biKyUzNNx17A4iyxFFvdtAsvDt7oeO4WRavDbwA6GZOKpnlITa9397XL47zZ48lLuMvjSoU4UAtRtIbBM_cW2QQJe9ZIn9-Y7CrURruV6qua2MkyXLsYf-b0ghCrUvH8psrt7a_2PSRM2xepJ-Nk5adyXJgXQrxsJXFNL3wMB2nZ1xbAz5v_zLetsm5McSZymWm8M8QlpGzI6JOEwiCbBhssVhpVufJH4H82rI9z-p8CcF1UoAmgKBBCcjmz9JkJ1V3oNfCVaG0Hg2zcvavOqsMAqmWQ',
        //     dp: '1BW1kh3u645QbKvktE0yKUGn82ZMU96Eg4_A73UJV1gnkGPYTYcjY1qRpeeGuMNBbh5DKsi3CkgZ4Xc1UM_NBJr4K_eWTJgFJfilb8Rqb0XjxEhJCo637rWUSY5iBwDerNUozVUrv8NjDcr2uC1qaWb9mMUtGjiQMeLhOJstvMTqldz5pgEFB4OYjTekRMXBFFpy2eDBeBz5EcOtM_312oMM9RDeaNgTsD6CTKKaSFdWVAuKFSpAoB1m2Gjrxqm75TvzuZsb53vPo9dcrjwik4S6S0Pfl23fRFQZm7X4kk9DF9dgloCHThEq5tAGno2xUxVfPwCgv4ZHkIZNb6tT-Q',
        //     dq: 'pAjwxgcKNS4iqaqtXk0syFUHkWpmNOmtrCHx7lYQa6-UdXfmCOaMp0qxZFT6cqLVfx4fekjKgjE1QkvP7L3ulWDRAxzJcpY7iqjrSkeIi4QXMWHlqgQP_ZpnsUzcY7ipwU0BkoyZhqNJZl9ok_8eQ6cOtYXtHKXEcLxaa2MPg6u-LRN0pr1AeuXlB4sUEZ9Z_5e6XAylr64DZa6oNNWzftWEy8RLDpq7O5uyH87YpOnR8vFUN5XavtvrvC0uxklxayae0o02QBs3tbPb503DRhngmDHvXSd4r0Apld3Xw2gMRrjZrIFdw_D6FRGeSCaXKigcSkYs6DsdJ78hJCUd8Q',
        //     qi: 'qtHs-1bHqIMwL1KG4qOWB1c79YLFmEtvKx9-ShEkpaztPASTjESr-AmxqWT63aFVPtqhDcsndwuAGXpgEXZUkiNqawLiVE5uhryxS5ZM_AwhP_YAzFtyEVMQf47jfwMJ6sxol0meovmCRSjkYOvaHb8dzyLaHkLjxS_SEf96x4ebCcaENKCkJB4fnC49Lzu4GKdKXVJyib6kBZV77UhChk2zI_jyouOvT4JZmHkgR2XOz425uCcmH8vj4VUfVe1geVYq4Ma09vv4wQzZaun_-7lzFlMITWLJUUP3miLaixcEUfOEo-bm8dYUVwCurjSfxpzGYKhmvjWAm2wSdZBBow'
        // };
        // const signature = console.log(sign({
        //     data: testQuery,
        //     timestamp: timestamp,
        //     hash: testHash,
        //     queryID: queryID,
        // }, privateJWK));
        
        // Saving necessary data parameter for checkQuerySig testing.
        const data = {
            query: testQuery,
            timestamp: timestamp,
            hash: testHash,
            salt: queryID,
            signature: signature,
        };

        // Checking that valid sample data returns expected value (true).
        const querySigValid = await checkQuerySig(data, getMoatModulus);
        expect(querySigValid).toBeTruthy();

    });

    it("Returns false with incorrect signature object", async () => {

        // Invalid private key signature.
        const signature = '0c27ed8749545590d03a51fb71a29ed723645433f1670af9e0eed81f11c172bbb0c73cab3ccd20e2968826b621e3eb68ec82e794e360d80f591ae9c5bded7a273af2c7950bc44b2ca03bd731d2c4ee1694428083f8cb3e7d1bbf214cacc199f3e3a0bc9dc5c629b93098015e53a8e0a5ab44d5d32ddcb509ed3d0ceb1b41dc68b5907a95777892a9b2946f020843f2d2ca63a8c883a52bf6ba26d7ecb4040788fb14f17a01dbd236b3e32335573f351d0907d117fa0f4f0c1f2954015a7c6ac47626d649a348969d9f6df0d9c8ae31380504c618bec07f53b879dcd8180daeb1d0ba9541472fd3a0027c4afd28ada8d02cb518c72861b4b0bd8d8819dc56170ab125b1aaefecfae10bdeecea8cc2bd8068b390a58130ff02cecc02c95a3ab3495ce6617260227bd68accc79dae366ac43b2c6ae72256eae1550e623271136263a99e9777eaf5b47bd35b7cfcdaff7239eb35b5c03a773ab12a358edb34ce56e5a7f7adc68c21932bda9812c2144ee4502a178766ea24b43eaf064b9b2a45d87bf859e30c2f5314ca0e48aa796798fbc2cdf5d3cd0fcbed2791770922c54c4239454fc81cefc0dc9b41c6d075284510460f9fe48d400b0ab5ddb2bcea5f60a69a36adb8f38c363f6e7e3b7daec1d90af1a85e5fb0fedd0144a44316d51b3fa4252ffdac54bd4b6c8ee04123ba4105161b7827455fdeba773b1ac0902de302a974';
        
        // Adding necessary valid private key credentials for current test_moat and getting necessary signature. ***
        // const invalidPrivateJWK = {
        //     kty: 'RSA',
        //     n: 'qoPsyyvc6m1M98is4jAmJJgjFqXakOfqL2JxFF4VY8s47RFSlz8sNSCvJpQINIFIkzmvVKbIdNJhabs0cAVlF0k5XjFbFw9idjdb-FCoBgRc0QkcnCbooYDe6EqhE68kIG7xy4V9IKdW2tq63J0LdsiX421cEBz5-FCpKu5vV07ZHlZiwLMDlO1_ynVeSNJwIcY2ErHuxrnyBLBHFnhYS32UXqO1LecEORRZti0xagr0x0LiCbAPFZzNMLTSOpvSCzipxgnF3EjVbosn6Dnz7XgQWGjOGG4kxmcR4dHvF9d-YvOc_w5OSdP8qCwrJH1hFnRopXLo9D7hEc4M8Y4hvQNIc9UKJeVmjBqVtau90RM65NWm1sTHCRAEmKWoswQgjEz2brXR0nBPNDKiibGsac1cefi7nMb2Qz_2MDcu6p-YsNoQ1oSmD0Ecyenyi9MLw7yKWcPp7njH3Xozpw4T7XAR581GGHzr2g82zRGOylpLzn9UiRs2T98yaKyjp9itjag0uPW69HT25zdgMemGSPO0b4yU4wwmBhfOpOICDuiF7gXlM8AdlPcBlhcj639U6wgfU3_2FnL61ozk5y4428Fdbs4d4RIXgpTnWeQgAx0jGg57L--70ET1o9CCtaZOGhYXolRmPnRnhdRXSpPLetdCxawsu__tu5I7kOSKxpU',
        //     e: 'AQAB',
        //     d: 'E-a732aqLQ4-unjIfMnD2eeLyNvoq5r1wTwLGKZ2dqREa57m9dIgtb6v0p_aaU5hixVjekzQ_pmDVxTLZPusNdCNCopWKFXaVxPU_yFiyvj9YERg-3SrGBZzbccwD50UaVipjehxlzsQrxByWMdXjDCTUa703MiVAD9hzynvAtCoFJtegUEjfOFPVfDm5TbycW6x5vKvfLA9KADu-xdmrsDkbTtMLSRWYNcYNWQG7WqD8THEMf9Dc3FOnY2tL7v6AudFIWEIn9I8Xt-M89S3vJKTzc3FqCJK1oE3HBUlg7HaBXCLdVVVG9bLGVG2Y1bi2v0RLaZAvCkOmcZjylmdZEJTNY5xvlguZZwW8xGR01Fnwj1G3rIVXpvybZg9_DFLFPURSJSmcCmiirG3Z7iN7DXvy_fLp8qFunWex2brA_MtHrjNUxphbIyhqsUK3ExECUBXe1csyiiJSQ9pkypUatjV6IkcswLONNXJnWul47zW9DTEc_PFh39dSIuAHJpKLinlKgvFvzV5MIABu3c6Y5sfig21ECEOUAUpu4aCt-lcpevOw2skfSjbbbRg_JrWBgEwCg5f89ILWQvwG6jukk7BBc8GJQGlTZpZJxw4GhzHF_pU8xD_7Cp8EVm872_TVn1tT94lfXbjxPAmxkwgdcZVCY-djvQhJ2OhqBeWysE',
        //     p: '1RERPIpSKiyTepEXohmLfdLpNgGL3n9_egAxqJD7cfj-AydKXA-7cYmlNq5CDIpM9VQdYKH-xFRygQd6HEWaLtZ2rSDa_UH12Lf7ddE5Xihldyt6PBShoTFTZOhwX1KsRusaoK9AWkweuZ-jpAn-I3Vo1ztkevwmwB5nBSvoBXmpR7iLMaVWev4pNl7dgSCaF3_4rTxnON8Mv-dsQyMm0rC5wG9i362ezyzIFSA1ZFVwt9yi7yhlwVBBrtKr7XgdqgdxGsqIt8bp20oNUk4qMc2VXAEI0VsFSWJR2-xBtIO853FyMUHigmmGqQCMMNnGGqkt7ii5tYEmteF4iSahMQ',
        //     q: 'zN_egeXpsGy_8l14gI79Wd0AG3EVLyvnHqJSWYNWRNVQxLJ4qOkNp7Jev19_gVV-nB-50T5Ha-gIZGRz2QgTfPBZo3KUWwcXxBcLvnnVrpwp4VenlTdZ-_yhsEPMOQble3VoCCrwHX76bCqmdQFassgJoLaN8YoTAJiC0OnF1fzjZ15cQXbPXlSDdglYqNy8XUEcB-fNDJgIL_vQjyHlcEd9SMAs2eFxX_ApwFOIumunMAdose_a3UUiuwZL880eKwmqByHPkwiQb8H_pY8ZpreFp00XSjBKprEUPwMNVprcmrmwtScd2UBNsFob5ozV4J5IKnubJsbUFvyxquqCpQ',
        //     dp: 'Gt7JJrJnBEyU2Ms9iMLh9Z9Iq_fr9MZthCxMFu8Z1tjI6ArndM7DG-F5BXlaeQxkAjh2b_5eC9J-kkkoHDKm7Cs90j2ngHL2Fzu0qboWGwrLKQlBpBwR-isnUj2CFnNtqI_zzrnrSrf40_4O_BwKgdxHuYUS-fOcy3PKGDveSfp638GlRECOtHojJmk2VBeRd087RFWuytxOVlFQNPNU7RM-icdCV-Ukdwo1vXxPX3Tq_zUDE1gr5QJDFlIZPpx8WToRCIjsTwj16yLepTeYWKmNoYm72_M3qnaMzkhwTNykUSfcd9vQPhQi2GNqSqrcMfaOBU_7g6ljAWMK-Xj2sQ',
        //     dq: 'A-OL-bM_iFXIHvWfP_F25anIQr0WxdpzfKVgIsrXbF8QNWud1rb1x2UfX0qUxQO2b4g6oron6OhyoFU3zbrVg92cFfoqzr-Ht_UoB-mQIMxeDyT2zWJLlvjoqMvgqIR0_q7v1pfaDvVGE5-LoVTxP8uEQ0Sz1Q3l5nD-qrCFTNaMCn5ECgoTTZsVE7yBrlLiUHLX8V55CfAo16BUCSN_k24H9sWPFGOvHz8Ty87KHZ_FgKfjWN1QrjqNujcYYfxWwkJgs9n0croK49Qu4hmhRwTcyJwyAPqBsEBUPg30xtwRq-4yaH3hlyodT2emd-3ccXMPs569BzNm-zi4tqHU8Q',
        //     qi: 'yj9Ae2KchL2m1sAkjZ6ch2aFJlDJcO80mK6U1Ovll5II-8CCydF-KtPEfNb-6jwB3r-E94KCcNVTzWzKIrjmYkvxN4nRa0ZqGDB_RYHNKwwvrBVUftHMlIDMRenwlUmrNNJ-anl4uFyljL28MjbevU37pnrbclGuL2v12gI2IN38sp29MM3p7HL7x_70sadCQrf07xz8olSVHB46DxgK3U-1TecfXyxc-GZ-33cfNA_yGIiYydSXjcoWyCYOw5GZG8Mu9Sm-Hfju8seVol2D5Osw367iPvYk0XFdlWVhwxsSEXL5-caCjkZnF4ruqwiM0ib98_ZaOlSFDPtqoSc8hg'
        // };
        // const signature = console.log(sign({
        //     data: testQuery,
        //     timestamp: timestamp,
        //     hash: testHash,
        //     queryID: queryID,
        // }, invalidPrivateJWK));
        
        // Saving necessary data parameter for checkQuerySig testing.
        const data = {
            query: testQuery,
            timestamp: timestamp,
            hash: testHash,
            salt: queryID,
            signature: signature,
        };

        // Checking that valid sample data interpereted correctly to be false.
        const querySigValid = await checkQuerySig(data, getMoatModulus);
        expect(querySigValid).toBeFalsy();

    });

    it("Returns false with non-expected data object parameters", async () => {

        // Inputs invalid data and checks that return value is expected (false).
        const querySigValid = await checkQuerySig({ invalid: 'data' }, getMoatModulus);
        await expect(querySigValid).toBeFalsy();

    });
});

describe("createSignedQuery", () => {

    it("Returns correctly filtered object with inputted data", () => {

        // Checks that inputted object with expected and extra parameters returns expected object.
        const testObjectExtra = {
            query: 'testQuery',
            timestamp: 'testTimestamp',
            hash: 'testHash',
            queryID: 'testQueryID',
            extra1: 'testExtra1'
        };
        const testObject = {
            data: 'testQuery',
            timestamp: 'testTimestamp',
            hash: 'testHash',
            queryID: 'testQueryID'
        };
        expect(createSignedQuery(testObjectExtra)).toEqual(testObject);

    });

    it("Throws error with non-expected data object parameters", async () => {

        // Sets invalid test object and check that return value throws expected error.
        const invalidTestObject = {
            query: 'testQuery',
            timestamp: 'testTimestamp',
            hash: 'testHash',
            queryID: 'testQueryID',
            extra1: 'testExtra1'
        };
        await expect(createSignedQuery(invalidTestObject)).toThrow('Parameter doesn\'t contain necessary input { data: \'value\', timestamp: \'value\', hash: \'value\', queryID: \'value\' }');

    });

});
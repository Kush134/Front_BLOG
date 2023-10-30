import styles from "@/styles/Statistics.module.css";
import React, { useEffect, useState } from "react";
import * as Contract from "@/contract";

interface Props {
  profileId: string;
}

const Statistics: React.FC<Props> = ({ profileId }) => {
  const [dataLoading, setDataLoading] = useState(true);
  const [tokenURI, setTokenURI] = useState("");
  const [authorsAmountsInETH, setAuthorsAmountsInETH] = useState("");
  const [authorsAmountsInUSD, setAuthorsAmountsInUSD] = useState("");
  const [nftMetadata, setNFTMetadata] = useState<any>();
  const [nftImage, setNFTImage] = useState<any>();

  const loadDatas = async () => {
    const tokenURIPromise = Contract.statistics
      .getTokenURI(profileId)
      .then(async (uri) => {
        setTokenURI(uri);
        await loadMetaData(uri);
      });

    const authorsAmountsInETHPromise = Contract.statistics
      .getAuthorsAmountsInETH(profileId)
      .then((amount) => setAuthorsAmountsInETH(amount));

    const authorsAmountsInUSDPromise = Contract.statistics
      .getAuthorsAmountsInUSD(profileId)
      .then((amount) => setAuthorsAmountsInUSD(amount));

    await Promise.all([
      tokenURIPromise,
      authorsAmountsInETHPromise,
      authorsAmountsInUSDPromise,
    ]);
  };

  const loadMetaData = async (uri: string) => {
    const _tokenURI = uri.replace("ipfs://", "https://ipfs.io/ipfs/");
    const response = await fetch(_tokenURI);
    const metadata = await response.json();
    setNFTMetadata(metadata);

    const _imageURI = metadata.image.replace(
      "ipfs://",
      "https://ipfs.io/ipfs/"
    );
    const imageData = await fetch(_imageURI);
    const blob = await imageData.blob();
    const imageURL = URL.createObjectURL(blob);
    setNFTImage(imageURL);

    setDataLoading(false);
  };

  useEffect(() => {
    loadDatas();
  }, []);

  return (
    <>
      <div className={styles.container}>
        <div className={styles.wrapper}>
          {dataLoading ? (
            <Spinner />
          ) : (
            <>
              <img className={styles.image} src={nftImage} alt="NFT Image" />
              <h3>{nftMetadata?.name}</h3>
            </>
          )}
        </div>

        <div className={styles.textWrapper}>
          <h2>Statistics</h2>
          {!dataLoading &&
            <>
              <div>
                <p>Total Amount</p>
                <h3>KUSH {authorsAmountsInETH}</h3>
              </div>
              <div>
                <p>Equivalent to USD</p>
                <h3>$ {authorsAmountsInUSD}</h3>
              </div>
            </>
          }
        </div>
      </div>
    </>
  );
};

const Spinner = ({ width = "50px", height = "50px" }) => {
  return (
    <div
      className={styles.sk_chase}
      style={{
        width: width,
        height: height,
      }}
    >
      <div className={styles.sk_chase_dot}></div>
      <div className={styles.sk_chase_dot}></div>
      <div className={styles.sk_chase_dot}></div>
      <div className={styles.sk_chase_dot}></div>
      <div className={styles.sk_chase_dot}></div>
      <div className={styles.sk_chase_dot}></div>
    </div>
  );
};

export default Statistics;

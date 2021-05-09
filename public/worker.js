onmessage = async _message => {
    const getRand = () => {
      const arr = new Uint8Array(8);

      for (let i = 0; i < 8; i++) {
        const rand = Math.floor(Math.random() * 255);
        arr[i] = rand;
      }

      return arr;
    };

    const toHex = buffer => {
      return [...new Uint8Array(buffer)].map(b => b.toString(16).padStart(2, "0")).join("");
    };

    let {
      mining_account,
      account,
      account_str,
      difficulty,
      last_mine_tx,
      last_mine_arr
    } = _message.data;
    account = account.slice(0, 8);
    const is_wam = account_str.substr(-4) === '.wam';
    let good = false,
        itr = 0,
        rand = 0,
        hash,
        hex_digest,
        rand_arr,
        last;
    const start = new Date().getTime();

    while (!good) {
      rand_arr = getRand();

      const combined = new Uint8Array(account.length + last_mine_arr.length + rand_arr.length);
      combined.set(account);
      combined.set(last_mine_arr, account.length);
      combined.set(rand_arr, account.length + last_mine_arr.length);
      hash = await crypto.subtle.digest('SHA-256', combined.slice(0, 24));
      hex_digest = toHex(hash);

      if (is_wam) {
        good = hex_digest.substr(0, 4) === '0000';
      } else {
        good = hex_digest.substr(0, 6) === '000000';
      }

      if (good) {
        if (is_wam) {
          last = parseInt(hex_digest.substr(4, 1), 16);
        } else {
          last = parseInt(hex_digest.substr(6, 1), 16);
        }

        good &= last <= difficulty;
      }

      itr++;

      if (itr % 1000000 === 0) {
        console.log(`Still mining - tried ${itr} iterations`);
      }

      if (!good) {
        hash = null;
      }

      if (itr >= 1000000 * 10) break;
    }

    const end = new Date().getTime();
    const rand_str = toHex(rand_arr);
    console.log(`Found hash in ${itr} iterations with ${account} ${rand_str}, last = ${last}, hex_digest ${hex_digest} taking ${(end - start) / 1000}s`);
    const mine_work = {
      account: account_str,
      rand_str,
      hex_digest
    };
    this.postMessage(mine_work);
    return mine_work;
  }

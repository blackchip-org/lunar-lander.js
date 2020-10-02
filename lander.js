// C-FOCAL,1969
function *lunarLander(out) {

    // full program as objects containing line numbers, remarks, functions
    let code = []

    // program counter (array index into code)
    let pc = 0

    // map of line number to code array index
    let lines = {}

    // The % operator
    let fmt = {
        // total number of digits to display
        total: 8,
        // places after decimal point
        places: 4
    }

    // external process sets this value when input is required from
    // the user
    let result = {
        input: ''
    };

    // number of lines executed (for help in stopping infinite loops early)
    let exec = 0

    // set to true after initializing via query string 
    let init = false 

    // set to true when it is time to terminate the program
    let done = false

    // add a line to the program with line number, 'num', the original 
    // source in the remark, 'rem', and the function 'fn', to execute. 
    function line(num, rem, fn) {
        lines[num] = code.length
        code.push({ num, rem, fn })
    }

    // FOCAL DO command. Execute block of code from the line number starting
    // with 'start' and ending with 'end'. FOCAL doesn't have an end, this 
    // is here due to pure laziness as it is easier to implement.  
    function* do_(start, end) {
        let prev = pc
        goto_(start)
        while (!done) {
            let op = code[pc]
            let execLineNum = op.num
            if (exec > 10000) {
                throw new Error(`execution limit exceeded: ${JSON.stringify(op, null, 2)}`)
            }
            debug()
            console.log(`${op.num} ${op.rem}`)
            exec++
            pc++
            yield* op.fn()
            if (execLineNum === end) {
                pc = prev
                break
            }
        }
    }

    // FOCAL FITR function: the integer part function outputs the integer 
    // part of a number up to 2046
    function fitr(x) {
        return Math.trunc(x)
    }

    // FOCAL FSQRT function: Square root
    function fsqrt(x) {
        return Math.sqrt(x)
    }

    // FOCAL GOTO statement
    function goto_(num) {
        if (!(num in lines)) {
            throw new Error(`no such line: ${num}`)
        }
        pc = lines[num]
    }

    // FOCAL TYPE statement. Only intended for numeric values that need
    // to have formatting applied
    function type(v) {
        let s = v.toFixed(fmt.places)
        out.print(s.toString().padStart(fmt.total + 1, " "))
    }

    // From https://www.cs.brandeis.edu/~storer/LunarLander/LunarLanderTranslations/LunarLanderJohnsonTranslation-c.txt
    // Global variables
    //
    // A - Altitude (miles)
    // G - Gravity
    // I - Intermediate altitude (miles)
    // J - Intermediate velocity (miles/sec)
    // K - Fuel rate (lbs/sec)
    // L - Elapsed time (sec)
    // M - Total weight (lbs)
    // N - Empty weight (lbs, Note: M - N is remaining fuel weight)
    // S - Time elapsed in current 10-second turn (sec)
    // T - Time remaining in current 10-second turn (sec)
    // V - Downward speed (miles/sec)
    // W - Temporary working variable
    // Z - Thrust per pound of fuel burned
    let a = 0
    let g = 0
    let i = 0
    let j = 0
    let k = 0
    let l = 0
    let m = 0
    let n = 0
    let p = '' // try again result
    let s = 0
    let t = 0
    let v = 0
    let w = 0
    let z = 0

    function debug() {
        let vars = {a, g, i, j, k, l, m, n, s, t, v, z}
        console.log(JSON.stringify(vars, null, 2))
    }

    line(
        "01.04",
        'T "CONTROL CALLING LUNAR MODULE. MANUAL CONTROL IS NECESSARY"!',
        function* () {
            out.println("CONTROL CALLING LUNAR MODULE. MANUAL CONTROL IS NECESSARY")
        }
    )

    line(
        "01.06",
        'T "YOU MAY RESET FUEL RATE K EACH 10 SECS TO 0 OR ANY VALUE"!',
        function* () {
            out.println("YOU MAY RESET FUEL RATE K EACH 10 SECS TO 0 OR ANY VALUE")
        }
    )

    line(
        "01.08",
        'T "BETWEEN 8 & 200 LBS/SEC. YOU\'VE 16000 LBS FUEL. ESTIMATED"!',
        function* () {
            out.println("BETWEEN 8 & 200 LBS/SEC. YOU'VE 16000 LBS FUEL. ESTIMATED")
        }
    )

    line(
        "01.11",
        'T "FREE FALL IMPACT TIME-120 SECS. CAPSULE WEIGHT-32500 LBS"!',
        function* () {
            out.println("FREE FALL IMPACT TIME-120 SECS. CAPSULE WEIGHT-32500 LBS")
        }
    )

    line(
        "01.20",
        'T "FIRST RADAR CHECK COMING UP"!!!;E',
        function* () {
            out.println("FIRST RADAR CHECK COMING UP")
            out.println()
            out.println()
        }
    )

    line(
        "01.30",
        'T "COMMENCE LANDING PROCEDURE"!"TIME,SECS   ALTITUDE,"',
        function* () {
            out.println("COMMENCE LANDING PROCEDURE")
            out.print("TIME,SECS   ALTITUDE,")
        }
    )

    line(
        "01.40",
        'T "MILES+FEET   VELOCITY,MPH   FUEL,LBS   FUEL RATE"!',
        function* () {
            out.println("MILES+FEET   VELOCITY,MPH   FUEL,LBS   FUEL RATE")
        }
    )

    line(
        "01.50",
        'S A=120;S V=1;S M=32500;S N=16500;S G=.001;S Z=1.8',
        function* () {
            a = 120
            v = 1
            m = 32500
            n = 16500
            g = .001
            z = 1.8

            // Variables assumed to be zero do not seem to get initialized
            // when the game is replayed. 
            l = 0

            // Initialize with query string if provided
            if (!init) {
                let params = new URLSearchParams(window.location.search);
                let pa = params.get("a")
                if (pa) {
                    a = Number.parseFloat(pa) 
                }
                let pl = params.get("l")
                if (pl) {
                    l = Number.parseFloat(pl)
                }
                let pf = params.get("f")
                if (pf) {
                    m = 16500 + Number.parseFloat(pf)
                }
                let pv = params.get("v")
                if (pv) {
                    v = Number.parseFloat(pv) / 3600
                }                
            }
            init = true
        }
    )

    line(
        "02.10",
        'T "    "%3,L,"           "FITR(A),"  "%4,5280*(A-FITR(A))"',
        function* () {
            out.print("    ")
            fmt.total = 3
            fmt.places = 0
            type(l)
            out.print("           ")
            type(fitr(a))
            out.print("  ")
            fmt.total = 4
            type(5280 * (a - fitr(a)))
        }
    )

    line(
        "02.20",
        'T %6.02,"       ",3600*V,"    ",%6.01,M-N,"      K=";A K;S T=10',
        function* () {
            fmt.total = 6
            fmt.places = 2
            out.print("        ")
            type(3600 * v)
            out.print("     ")
            fmt.total = 6
            fmt.places = 1
            type(m - n)
            out.print("      K=:")
            yield result
            k = Number.parseFloat(result.input)
            t = 10
        }
    )

    line(
        "02.70",
        'T %7.02;I (200-K)2.72;I (8-K)3.1,3.1;I (K)2.72,3.1',
        function* () {
            fmt.total = 7
            fmt.places = 2
            if (200 - k < 0) {
                goto_("02.72")
            } else if (8 - k <= 0 ) {
                goto_("03.10")
            } else if ( k < 0 ) {
                goto_("02.72")
             } else if ( k == 0 ) {
                goto_("03.10")
             }
        }
    )

    line(
        "02.72",
        'T "NOT POSSIBLE";F X=1,51;T "."',
        function* () {
            out.print('NOT POSSIBLE')
            for (x = 1; x <= 51; x++) {
                out.print('.')
            }
        }
    )

    line(
        "02.73",
        'T "K=";A K;G 2.7"',
        function* () {
            out.print("K=:")
            yield result
            k = Number.parseFloat(result.input)
            goto_("02.70")
        }
    )

    line(
        "03.10",
        'I (M-N-.001)4.1;I (T-.001)2.1;S S=T',
        function* () {
            if (m-n-.001 < 0) {
                goto_("04.10")
            } else if (t-.001 < 0) {
                goto_("02.10")
            } else {
                s = t
            }
        }
    )

    line(
        "03.40",
        'I ((N+S*K)-M)3.5,3.5;S S=(M-N)/K',
        function* () {
            if ((n+s*k)-m <= 0) {
                goto_("03.50")
            } else {
                s = (m-n)/k
            }
        }
    )

    line(
        "03.50",
        'D 9;I (I)7.1,7.1;I (V)3.8,3.8;I (J)8.1',
        function* () {
            yield* do_("09.10", "09.40")
            if (i <= 0) {
                goto_("07.10")
            } else if (v <= 0) {
                goto_("03.80")
            } else if (j < 0) {
                goto_("08.10")
            }
        }
    )

    line(
        "03.80",
        'D 6;G 3.1',
        function* () {
            yield* do_("06.10", "06.10")
            goto_("03.10")
        }
    )

    line(
        "04.10",
        'T "FUEL OUT AT",L," SECS"!',
        function* () {
            out.print("FUEL OUT AT")
            type(l)
            out.println(" SECS")
        }
    )

    line(
        "04.40",
        'S S=(FSQT(V*V+2*A*G)-V)/G;S V=V+G*S;S L=L+S',
        function* () {
            s = (fsqrt(v*v+2*a*g)-v)/g
            v = v+g*s
            l = l+s
        }
    )

    line(
        "05.10",
        'T "ON THE MOON AT",L," SECS"!;S W=3600*V',
        function* () {
            out.print("ON THE MOON AT")
            type(l)
            out.println(" SECS")
            w = 3600*v
        }
    )

    line(
        "05.20",
        'T "IMPACT VELOCITY OF"W," M.P.H."!"FUEL LEFT:"M-N," LBS"!',
        function* () {
            out.print("IMPACT VELOCITY OF")
            type(w)
            out.println(" M.P.H.")
            out.print("FUEL LEFT:")
            let f = m-n 
            // Is there ever a check to see if fuel is below zero?
            if (f < 0) {
                f = 0
            }
            type(f)
            out.println(" LBS")
        }
    )

    line(
        "05.40",
        'I (1-W)5.5,5.5;T "PERFECT LANDING !-(LUCKY)"!;G 5.9',
        function* () {
            if (1-w <= 0) {
                goto_("05.50")
            } else {
                out.println("PERFECT LANDING !-(LUCKY)")
                goto_("05.90")
            }
        }
    )

    line(
        "05.50",
        'I (10-W)5.6,5.6;T "GOOD LANDING-(COULD BE BETTER)";G 5.9',
        function* () {
            if (10-w <= 0) {
                goto_("05.60")
            } else {
                out.println("GOOD LANDING-(COULD BE BETTER)")
                goto_("05.90")
            }
        }
    )

    line(
        "05.60",
        'I (22-W)5.7,5.7;T "CONGRATULATIONS ON A POOR LANDING";G 5.9',
        function* () {
            if (22-w <= 0) {
                goto_("05.70")
            } else {
                out.println("CONGRATULATIONS ON A POOR LANDING")
                goto_("05.90")
            }
        }
    )

    line(
        "05.70",
        'I (40-W)5.81,5.81;T "CRAFT DAMAGE. GOOD LUCK";G 5.9',
        function* () {
            if (40-w <= 0) {
                goto_("05.81")
            } else {
                out.println("CRAFT DAMAGE. GOOD LUCK")
                goto_("05.90")
            }
        }
    )

    line(
        "05.81",
        'I (60-W)5.82,5.82;T "CRASH LANDING-YOU\'VE 5 HRS OXYGEN";G 5.9',
        function* () {
            if (60-w <= 0) {
                goto_("05.82")
            } else {
                out.println("CRASH LANDING-YOU\'VE 5 HRS OXYGEN")
                goto_("05.90")
            }
        }
    )

    line(
        "05.82",
        'T "SORRY,BUT THERE WERE NO SURVIVORS-YOU BLEW IT!"!"IN "',
        function* () {
            out.println("SORRY,BUT THERE WERE NO SURVIVORS-YOU BLEW IT!")
            out.print("IN ")
        }
    )

    line(
        "05.83",
        'T "FACT YOU BLASTED A NEW LUNAR CRATER"W*.277777," FT. DEEP"!',
        function* () {
            out.print("FACT YOU BLASTED A NEW LUNAR CRATER")
            type(w*.277777)
            out.println(" FT. DEEP")
        }
    )

    line(
        "05.90",
        'T !!!!"TRY AGAIN?"!',
        function* () {
            out.println()
            out.println()
            out.println()
            out.println()
            out.println("TRY AGAIN?")
        }
    )

    line(
        "05.92",
        'A "(ANS. YES OR NO)"P;I (P-0NO)5.94,5.98',
        function* () {
            out.print("(ANS. YES OR NO):")
            yield result
            p = result.input.toUpperCase()
            if (p === 'NO') {
                goto_("05.98")
            } else {
                goto_("05.94")
            }
        }
    )

    line(
        "05.94",
        'I (P-0YES)5.92,1.2,5.92',
        function* () {
            if (p === 'YES') {
                goto_("01.20")
            } else {
                goto_("05.92")
            }
        }
    )

    line(
        "05.98",
        'T "CONTROL OUT"!!!;Q',
        function* () {
            out.println("CONTROL OUT")
            out.println()
            out.println()
            done = true
        }
    )

    line(
        "06.10",
        'S L=L+S;S T=T-S;S M=M-S*K;S A=I;S V=J',
        function* () {
            l = l+s
            t = t-s
            m = m-s*k
            a = i
            v = j
        }
    )

    line(
        "07.10",
        'I (S-.005)5.1;S S=2*A/(V+FSQT(V*V+2*A*(G-Z*K/M)))',
        function* () {
            if (s-.005 < 0) {
                goto_("05.10")
            } else {
                s = 2*a/(v+fsqrt(v*v+2*a*(g-z*k/m)))
            }
        }
    )

    line(
        "07.30",
        'D 9;D 6;G 7.1',
        function* () {
            yield* do_("09.10", "09.40")
            yield* do_("06.10", "06.10")
            goto_("07.10")
        }
    )

    // From: https://www.cs.brandeis.edu/~storer/LunarLander/LunarLanderTranslations/LunarLanderJohnsonTranslation-c.txt
    // FOCAL-to-C gotcha: In FOCAL, multiplication has a higher
    // precedence than division.  In C, they have the same
    // precedence and are evaluated left-to-right.  So the
    // original FOCAL subexpression `M * G / Z * K` can't be
    // copied as-is into C: `Z * K` has to be parenthesized to
    // get the same result.
    line(
        "08.10",
        'S W=(1-M*G/(Z*K))/2;S S=M*V/(Z*K*(W+FSQT(W*W+V/Z)))+.05;D 9',
        function* () {
            w = (1-m*g/(z*k))/2;
            s = m*v/(z*k*(w+fsqrt(w*w+v/z)))+ 0.5;
            yield* do_("09.10", "09.40")
        }
    )

    line(
        "08.30",
        'I (I)7.1,7.1;D 6;I (-J)3.1,3.1;I (V)3.1,3.1,8.1',
        function* () {
            if (i <= 0) {
                goto_("07.10")
            } else {
                yield* do_("06.10", "06.10")
                if (-j <= 0) {
                    goto_("03.10")
                } else if (v <= 0) {
                    goto_("03.10")
                } else {
                    goto_("08.10")
                }
            }
        }
    )

    line(
        "09.10",
        'S Q=S*K/M;S J=V+G*S+Z*(-Q-Q^2/2-Q^3/3-Q^4/4-Q^5/5)',
        function* () {
            q = s*k/m
            let q2 = Math.pow(q, 2)
            let q3 = Math.pow(q, 3)
            let q4 = Math.pow(q, 4)
            let q5 = Math.pow(q, 5)
            j=v+g*s+z*(-q-q2/2-q3/3-q4/4-q5/5)
        }
    )

    line(
        "09.40",
        'S I=A-G*S*S/2-V*S+Z*S*(Q/2+Q^2/6+Q^3/12+Q^4/20+Q^5/30)',
        function* () {
            let q2 = Math.pow(q, 2)
            let q3 = Math.pow(q, 3)
            let q4 = Math.pow(q, 4)
            let q5 = Math.pow(q, 5)
            i = a-g*s*s/2-v*s+z*s*(q/2+q2/6+q3/12+q4/20+q5/30)
        }
    )

    yield* do_("01.04")
    return
}


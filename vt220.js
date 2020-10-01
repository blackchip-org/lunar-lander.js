var display;

window.onload = function() {
    display = createDisplay({
        cols: 80,
        rows: 25,
        bgColor: "#222",
        fgColor: "#d4992f",
        font: "VT220",
        fontSize: 20,
        charWidth: 10,
        charHeight: 20,
        baselineOffset: 3,
        border: 50,
        borderColor: "#444",
        borderRadius: 20,
        caps: true
    });

    let output = {
        println: display.println,
        print: display.print
    }

    let exec = lunarLander(output)

    let process = function() {
        result = exec.next()
        if (result.done) {
            return
        }
        display.input((line) => {
            result.value.input = line
            process()
        })
    }

    process()
};


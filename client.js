console.log("QR code generator for PCM by github.com/maggie-lagos")

const get_or_default_int = (name, default_value) => {
    const stored = localStorage.getItem(name);
    if (stored != null) {
        try {
            return parseInt(stored);
        } catch (error) {
            console.warn(`Failed to parse stored entry for '${name}'`);
        } 
    }
    return default_value;
}

const header = document.getElementById("header");
const text_and_qr = document.getElementById("text-and-qr");

const input_textarea = document.getElementById("input");
const input_error = document.getElementById("input-error");

const result = document.getElementById("result-div");
const result_qrcode = document.getElementById("result-qrcode");
const result_error = document.getElementById("result-error");

const qrCode = new QRCodeStyling({
    width: 300,
    height: 300,
    type: "svg",
    data: "https://www.facebook.com/",
    image: "https://upload.wikimedia.org/wikipedia/commons/5/51/Facebook_f_logo_%282019%29.svg",
    dotsOptions: {
        color: "#4267b2",
        type: "rounded"
    },
    backgroundOptions: {
        color: "#e9ebee",
    },
    imageOptions: {
        crossOrigin: "anonymous",
        margin: 20
    }
});
console.log(qrCode)

//qrCode.download({ name: "qr", extension: "svg" });

// Size of the QR code in pixels. Set it to 0 to automatically fit the free space
let QR_MIN_SIZE = get_or_default_int("QR_MIN_SIZE", 30); //in pixels
let QR_MAX_SIZE = get_or_default_int("QR_MAX_SIZE", Infinity); // in pixels


window.addEventListener("load", () => {
    result_error.style.display = "none";
    // This needs to be done after loading the library
    //setEccLevel(ERROR_CORRECTION_LEVEL);
})

const PADDING = 10; // 5px on any side for the text-and-qr element -> always 10px in total

const showInputError = (message) => {
    // message is untrusted input, so we should escape it properly
    if (message) {
        input_error.innerHTML = ""; // remove current children
        const messageElement = document.createTextNode(message);
        input_error.appendChild(messageElement);
        input_error.style.display = "block";
    } else {
        input_error.style.display = "none";
    }
}

const showQrCodeGenerationError = (message) => {
    result_error.innerHTML = `${message}`;
    result_error.style.display = "block";
}

const on_window_resize = () => {
    const width = text_and_qr.clientWidth;
    const height = text_and_qr.clientHeight;
    if (!width || !height) {
        console.warn(`Size cannot be 0 or undefined. But size is (${width}, ${height})`)
    }

    const toStyleValue = (size_in_pixels) => {
        return `${Math.max(size_in_pixels - PADDING, 0)}px`
    }
    if (width < height) {
        const remaining_height = document.body.clientHeight - header.clientHeight - 100; // 100 is the minimum height of the input area div
        // portrait view -> vertical
        text_and_qr.style.flexDirection = "column";
        result_qrcode.style.maxWidth = "";
        result_qrcode.style.maxHeight = toStyleValue(Math.min(width, remaining_height));
    } else {
        // landscape view -> horizontal
        const remaining_width = document.body.clientWidth - 200; // 200 is the minimum width of the input area div
        text_and_qr.style.flexDirection = "row";
        result_qrcode.style.maxWidth = toStyleValue(Math.min(height, remaining_width));
        // Workaround for QR code not shrinking
        result_qrcode.style.maxHeight = toStyleValue(document.body.clientHeight - header.clientHeight);
    }

    updateQRCode();
};

const updateQRCode = () => {
    // TODO: update this to use a qr library that accepts logos
    // npm install qr-code-styling


    const max_size_fit_window = Math.min(result_qrcode.clientWidth, result_qrcode.clientHeight, QR_MAX_SIZE);
    const qr_size = Math.max(QR_MIN_SIZE, max_size_fit_window) - 10; // remove 2 * 5px for the paddings
    const text = input_textarea.value;

    if (!text) {
        showQrCodeGenerationError("You need to type some text in the input area! It will then be rendered as a QR code.");
        return
    }

    try {
        //const qr_code_object = qrcodegen.QrCode.encodeText(text, ecc_level);
        //const qr_code_object = "the QR code SVG will go here"
        //result_qrcode.innerHTML = qr_code_object //toSvgString(qr_code_object, QR_BORDER_SIZE, "white", "black");
        qrCode.append(result_qrcode);
    } catch (error) {
        showQrCodeGenerationError("Failed to generate the QR code! Please try a different input.");
    }
}

// Call resize shortly after loading the page to determine the inital layout
setTimeout(on_window_resize, 10);

// sometimes the event does not get called (for example when closing the browser console). So we call it regularly just to be sure
//setInterval(on_window_resize, 1000)

// Update the QR code whenever the text or the window size changes
// Use max-width/height to keep the QR code div in square shape and allow the textarea to use the remaining space
input_textarea.addEventListener("input", updateQRCode);

from io import BytesIO
from barcode import Code128, Code39
from barcode.writer import ImageWriter
import base64

def lambda_handler(event, context):
    # provider can be defined for generation
    # if not defined will default to code128
    provider = event.get('provider', 'code128')

    # render options (for sizes, see python barcode docs)
    # https://python-barcode.readthedocs.io/en/stable/writers/index.html
    # defaults to None
    options = event.get('options', None)

    try:
        code = event['code']
    except:
        raise Exception({
            'statusCode': 400,
            'body': 'event.code no puede estar vacio'
        })

    rv = BytesIO()

    if provider == 'code128':
        codex = Code128(code, writer=ImageWriter())
    elif provider == 'code39':
        codex = Code39(code, writer=ImageWriter())

    codex.write(rv, options)

    b64 = base64.b64encode(rv.getvalue()).decode('utf-8')

    return {
        'statusCode': 200,
        'body': b64
    }

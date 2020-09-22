'use strict'

const { getTestParser } = require('../get-test-parser')

describe('html normalizer', () => {
	it.each([
		'<div>&amp;&lt;123&456<789;&&</div>',
		'<div>&amp;&lt;123&456<789;&&</div>',
		'<div><123e>&<a<br/></div>',
		'<div>&nbsp;&copy;&nbsp&copy</div>',
		'<html xmlns:x="1"><body/></html>',
		'<html test="a<b && a>b && \'&amp;&&\'"/>',
		'<div test="alert(\'<br/>\')"/>',
		'<div test="a<b&&a< c && a>d"></div>',
		'<div a=& bb c d=123&&456/>',
		'<div a=& a="&\'\'" b/>',
		'<html test="123"/>',
		'<r><Label onClick="doClick..>Hello, World</Label></r>',
		'<Label onClick=doClick..">Hello, World</Label>',
	])('%s', (xml) => {
		const { errors, parser } = getTestParser()

		const actual = parser.parseFromString(xml, 'text/html').toString()

		expect({ actual, ...errors }).toMatchSnapshot()
	})

	it.each([
		'<html><meta><link><img><br><hr><input></html>',
		'<html title =1/2></html>',
		'<html title= 1/>',
		'<html title = 1/>',
		'<html title/>',
		'<html><meta><link><img><br><hr><input></html>',
	])('unclosed html %s', (xml) => {
		const { errors, parser } = getTestParser()

		const actual = parser.parseFromString(xml, 'text/html').toString()

		expect({ actual, ...errors }).toMatchSnapshot()
	})

	Array.from(['text/xml', 'text/html']).forEach((mimeType) => {
		it.each([
			'<script>alert(a<b&&c?"<br>":">>");</script>',
			'<script>alert(a<b&&c?"<br/>":">>");</script>',
			'<script src="./test.js"/>',
			'<textarea>alert(a<b&&c?"<br>":">>");</textarea>',
		])(`${mimeType}: script %s`, (xml) => {
			const { errors, parser } = getTestParser()

			const actual = parser.parseFromString(xml, mimeType).toString()

			expect({ actual, ...errors }).toMatchSnapshot()
		})
	})

	it('European entities', () => {
		const { errors, parser } = getTestParser()

		const actual = parser
			.parseFromString(
				'<div>&Auml;&auml;&Aring;&aring;&AElig;&aelig;&Ouml;&ouml;&Oslash;&oslash;&szlig;&Uuml;&uuml;&euro;</div>',
				'text/html'
			)
			.toString()

		expect({ actual, ...errors }).toMatchObject({
			// For the future, it may be nicer to use \uxxxx in the assert strings
			// rather than pasting in multi-byte UTF-8 Unicode characters
			actual: '<div xmlns="http://www.w3.org/1999/xhtml">ÄäÅåÆæÖöØøßÜü€</div>',
		})
	})
})

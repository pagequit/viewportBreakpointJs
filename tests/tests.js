QUnit.test( 'add breakpoints test', function( assert ) {

	// Add example breakpoints
	viewport.Breakpoint.add( new viewport.Breakpoint('xl', 1200) );
	viewport.Breakpoint.add( new viewport.Breakpoint('lg', 992) );
	viewport.Breakpoint.add( new viewport.Breakpoint('md', 768) );
	viewport.Breakpoint.add( new viewport.Breakpoint('sm', 576) );
	viewport.Breakpoint.add( new viewport.Breakpoint('xs', 1) );

	assert.ok( 1 == '1', 'Passed!' );
});


QUnit.test( 'resize test', function( assert ) {

	// Change the 'viewport' to 500px.
	window.innerWidth = 500;

	// Trigger the window resize event.
	window.dispatchEvent(new Event('resize'));

	assert.ok( 1 == '1', 'Passed!' );
});